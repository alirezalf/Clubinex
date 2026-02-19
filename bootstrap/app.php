<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\UpdateLastLogin::class,
            \App\Http\Middleware\CheckSessionTimeout::class,
        ]);

        $middleware->alias([
            'active.user' => \App\Http\Middleware\CheckActiveStatus::class,
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Request $request) {
            
            // مدیریت خطاهای HTTP استاندارد برای درخواست‌های اینرشیا
            if ($e instanceof HttpException && $request->inertia()) {
                $status = $e->getStatusCode();
                
                // هدایت به صفحه اختصاصی در پوشه Errors
                if (in_array($status, [403, 404, 500, 503])) {
                    return Inertia::render("Errors/{$status}", ['status' => $status])
                        ->toResponse($request)
                        ->setStatusCode($status);
                }
                
                // خطای انقضای نشست (419)
                if ($status === 419) {
                    return redirect()->route('login')->with('error', 'نشست شما منقضی شد. لطفا دوباره وارد شوید.');
                }
            }

            // مدیریت خطای اتصال به دیتابیس
            if (
                $e instanceof QueryException || 
                $e instanceof \PDOException || 
                $e instanceof \Illuminate\Database\ConnectionException
            ) {
                // کدهای خطای رایج دیتابیس
                if (in_array($e->getCode(), [2002, 1045]) || str_contains($e->getMessage(), 'Connection refused')) {
                    if ($request->inertia()) {
                         return Inertia::render('Errors/500', ['message' => 'خطای اتصال به پایگاه داده'])
                            ->toResponse($request)
                            ->setStatusCode(500);
                    }
                    return response()->view('errors.database', [], 503);
                }
            }
            
            return null; 
        });
    })->create();