<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use ZipArchive;

class MakeUpdatePackage extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:update {commit? : The base git commit hash to compare against} {--all : Package all files instead of diff}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create an update package zip for clients containing only changed files';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $commit = $this->argument('commit');
        $all = $this->option('all');

        $zipName = 'update-' . date('Y-m-d-His') . '.zip';
        $zipPath = base_path($zipName);

        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            $this->error("Failed to create zip file.");
            return 1;
        }

        $count = 0;

        if ($all) {
            $this->info("Packaging full release...");
            // This is complex to implement correctly without copying large vendor/node_modules.
            // A developer should typically use CI/CD for full releases.
            $this->error("--all is not fully implemented yet. Please use git diff approach.");
            return 1;
        } else {
            if (!$commit) {
                $this->error("Please specify a previous commit hash (e.g. php artisan make:update ab12cd3).");
                return 1;
            }

            $this->info("Getting changed files since commit: $commit");
            exec("git diff --name-only --diff-filter=ACMRT " . escapeshellarg($commit) . " HEAD", $files, $code);

            if ($code !== 0) {
                $this->error("Git command failed. Are you in a git repository or is the commit valid?");
                return 1;
            }

            foreach ($files as $file) {
                $filePath = base_path($file);
                if (is_file($filePath)) {
                    $zip->addFile($filePath, $file);
                    $count++;
                }
            }
        }

        // Always add public/build to ensure compiled front-end assets are included
        // even if they are in .gitignore
        $buildDir = base_path('public/build');
        if (is_dir($buildDir)) {
            $this->info("Including compiled frontend assets (public/build)...");
            $iterator = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($buildDir));
            foreach ($iterator as $file) {
                if (!$file->isDir()) {
                    $filePath = $file->getRealPath();
                    $relativePath = substr($filePath, strlen(base_path()) + 1);
                    $relativePath = str_replace('\\', '/', $relativePath);
                    $zip->addFile($filePath, $relativePath);
                    $count++;
                }
            }
        }

        $zip->close();

        $this->info("Update package created successfully: $zipName");
        $this->info("Total files packaged: $count");
        $this->comment("You can now send this file to your client. They can upload it via the Admin Panel -> System Tools.");
    }
}
