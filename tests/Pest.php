<?php

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind a different classes or traits.
|
| Installed App State:
| The CheckSetup middleware redirects every web request to /setup while the
| users table is empty. Each test runs against a freshly migrated in-memory
| database, so seed one user to simulate a normal (already-installed) app.
| The hook is registered through the uses() chain (not a bare beforeEach())
| because Pest v4 resolves global beforeEach() calls per test file, so a bare
| hook declared in Pest.php never runs.
|
*/

pest()->extend(Tests\TestCase::class)
    ->use(Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->beforeEach(function () {
        // Simulate a freshly installed app (like CI): security settings absent ->
        // captcha disabled. SystemSetting::getValue('security','captcha_enabled','0')
        // then resolves to '0' and the captcha validation rules stay off.
        \App\Models\SystemSetting::setValue('security', 'captcha_enabled', '0', 'فعال‌سازی کپچا');

        \App\Models\User::factory()->create();
    })
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Also, you can extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every test file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function something()
{
    // ..
}
