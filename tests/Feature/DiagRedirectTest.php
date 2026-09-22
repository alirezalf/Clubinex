<?php

test('diagnose login redirect', function () {
    $response = $this->get(route('login'));

    dump('STATUS: ' . $response->status());
    dump('LOCATION: ' . ($response->headers->get('Location') ?? '(none)'));
    if ($response->exception) {
        dump('EXCEPTION: ' . get_class($response->exception) . ': ' . $response->exception->getMessage());
    }

    $this->assertTrue(true);
});
