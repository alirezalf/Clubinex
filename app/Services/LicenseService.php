<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;

class LicenseService
{
    /**
     * The public key used to verify the license signature.
     * This ensures that only the generator holding the private key can create valid licenses.
     */
    private const PUBLIC_KEY = <<<EOD
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAo03hm+YWiOn+y7Fho6cL
lcib7w+QYe7F0+2XhAqrYq35YyrbvAwBGCsNcOTHb0HG1MPizqeTmdnRYdJc9lsg
SaT0RylhZhfIQl7pH9r7toaj24BpfYSraCArDn2fwIQO0c1bmqZ+QiUCHUtNQv5A
Vxp28GTAEzyxLXhtjL2oXn5VAOOqDPHucTcVyrjijpOK7HEDoWc/F7FaPx8RmEo9
tSd2KfTOUslEFnR4o0V1BSSf4VtZyBdMnSgJvKGehBVbzYZcyF2nVQjtvJom5hQh
M/iOQgB2iIQvoxAA+TY+4WerwGlT0PYMJPfOSgjdKn9H8BGxJ5FeamH/wqR9k7qX
JQIDAQAB
-----END PUBLIC KEY-----
EOD;

    /**
     * Generate a unique identifier for this server/installation
     *
     * @return string
     */
    public static function getMachineId(): string
    {
        // Use standard server parameters combined with the application's root path
        // This ensures moving the app to another directory or server changes the ID
        $components = [
            php_uname('n'), // Hostname
            php_uname('s'), // OS Name
            php_uname('r'), // Release name
            base_path(),    // Absolute path of the project installation
        ];

        return hash('sha256', implode('|', $components));
    }

    /**
     * Parse and verify a license token using RS256
     *
     * @param string $token JWT string
     * @return array|false Returns the claims array if valid, boolean false if invalid
     */
    public static function verifyLicense(string $token)
    {
        try {
            if (empty($token)) {
                return false;
            }

            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                return false;
            }

            [$header64, $payload64, $signature64] = $parts;

            // Check algorithm
            $header = json_decode(self::base64UrlDecode($header64), true);
            if (!$header || !isset($header['alg']) || $header['alg'] !== 'RS256') {
                return false;
            }

            // Verify signature using OpenSSL
            $dataToSign = $header64 . '.' . $payload64;
            $signature = self::base64UrlDecode($signature64);

            $isValid = openssl_verify(
                $dataToSign,
                $signature,
                self::PUBLIC_KEY,
                OPENSSL_ALGO_SHA256
            );

            if ($isValid !== 1) {
                return false;
            }

            // Verify claims
            $payload = json_decode(self::base64UrlDecode($payload64), true);

            $currentTime = time();

            // Anti-rollback detection
            // We use DB facade to prevent triggering Eloquent events (which clear cache continuously)
            try {
                $lastKnownTimeSetting = \Illuminate\Support\Facades\DB::table('system_settings')
                    ->where('group', 'general')
                    ->where('key', 'last_known_time')
                    ->first();

                $lastKnownTime = $lastKnownTimeSetting ? (int)$lastKnownTimeSetting->value : 0;

                if ($currentTime < $lastKnownTime) {
                    Log::warning('Clock rollback detected. Current time: ' . $currentTime . ', Last known: ' . $lastKnownTime);
                    return false;
                }

                // Update last known time if current time is greater by an hour
                if ($currentTime > $lastKnownTime + 3600) {
                    if ($lastKnownTimeSetting) {
                        \Illuminate\Support\Facades\DB::table('system_settings')
                            ->where('id', $lastKnownTimeSetting->id)
                            ->update(['value' => (string)$currentTime]);
                    } else {
                        \Illuminate\Support\Facades\DB::table('system_settings')->insert([
                            'group' => 'general',
                            'key' => 'last_known_time',
                            'value' => (string)$currentTime,
                            'type' => 'string',
                            'label' => 'آخرین بازدید زمانی',
                            'is_public' => false,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            } catch (\Exception $dbEx) {
                // If DB is not ready or throws exception, do not fail license verification
                // just log it.
                Log::error('License anti-rollback DB error: ' . $dbEx->getMessage());
            }

            // Check expiry
            if (isset($payload['exp']) && $payload['exp'] < $currentTime) {
                return false;
            }

            // Check machine ID
            $currentMachineId = static::getMachineId();
            if (isset($payload['machine_id']) && $payload['machine_id'] !== $currentMachineId) {
                return false; // Valid license but for a different server/domain
            }

            return $payload;
        } catch (Exception $e) {
            Log::error('License verification failed: ' . $e->getMessage());
            return false;
        }
    }

    private static function base64UrlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $padlen = 4 - $remainder;
            $data .= str_repeat('=', $padlen);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
