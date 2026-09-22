<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Pin the test environment before the application boots.
     *
     * Hosted sandboxes / CI runners may inject APP_ENV (e.g. "local") into the
     * process environment. Because phpdotenv is immutable and $_SERVER takes
     * precedence, the app would otherwise boot as "local" inside tests,
     * re-enabling CSRF (HTTP 419) and other non-testing behaviour.
     */
    protected function refreshApplication()
    {
        $_SERVER['APP_ENV'] = 'testing';
        $_ENV['APP_ENV'] = 'testing';
        putenv('APP_ENV=testing');

        parent::refreshApplication();
    }
}
