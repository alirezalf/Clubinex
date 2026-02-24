<?php

namespace App\Services\SMS;

interface SmsProviderInterface
{
    /**
     * Send a verification code (OTP).
     *
     * @param string $mobile
     * @param string $code
     * @param string|null $templateId
     * @return bool
     */
    public function sendVerify(string $mobile, string $code, ?string $templateId = null): bool;

    /**
     * Send a bulk/promotional message.
     *
     * @param string $mobile
     * @param string $message
     * @return bool
     */
    public function sendBulk(string $mobile, string $message): bool;
}
