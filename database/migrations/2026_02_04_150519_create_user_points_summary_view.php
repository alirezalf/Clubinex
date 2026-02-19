<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        // تغییر CREATE VIEW به CREATE OR REPLACE VIEW برای جلوگیری از خطا
        DB::statement("
            CREATE OR REPLACE VIEW user_points_summary AS
            SELECT 
                u.id as user_id,
                u.mobile,
                CONCAT(u.first_name, ' ', u.last_name) as full_name,
                u.club_id,
                c.name as club_name,
                c.slug as club_slug,
                
                -- محاسبه امتیازات
                COALESCE(SUM(CASE WHEN pt.type = 'earn' THEN pt.amount ELSE 0 END), 0) as total_earned,
                COALESCE(SUM(CASE WHEN pt.type = 'spend' THEN ABS(pt.amount) ELSE 0 END), 0) as total_spent,
                COALESCE(SUM(CASE WHEN pt.type = 'expire' THEN ABS(pt.amount) ELSE 0 END), 0) as total_expired,
                COALESCE(SUM(CASE WHEN pt.type = 'adjust' THEN pt.amount ELSE 0 END), 0) as total_adjusted,
                
                -- مانده فعلی (امتیازات معتبر)
                COALESCE(SUM(CASE 
                    WHEN pt.type = 'earn' AND (pt.expires_at IS NULL OR pt.expires_at > NOW()) THEN pt.amount 
                    WHEN pt.type IN ('spend', 'expire') THEN -ABS(pt.amount)
                    WHEN pt.type = 'adjust' THEN pt.amount
                    ELSE 0 
                END), 0) as current_balance,
                
                -- امتیازات در حال انقضا (تا 30 روز آینده)
                COALESCE(SUM(CASE 
                    WHEN pt.type = 'earn' 
                    AND pt.expires_at IS NOT NULL 
                    AND pt.expires_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
                    THEN pt.amount 
                    ELSE 0 
                END), 0) as expiring_soon,
                
                COUNT(DISTINCT CASE WHEN pt.type = 'earn' THEN pt.id END) as total_earn_transactions,
                COUNT(DISTINCT CASE WHEN pt.type = 'spend' THEN pt.id END) as total_spend_transactions,
                
                -- آخرین تراکنش
                MAX(pt.created_at) as last_transaction_at,
                
                -- زمان محاسبه
                NOW() as calculated_at
                
            FROM users u
            LEFT JOIN clubs c ON u.club_id = c.id
            LEFT JOIN point_transactions pt ON u.id = pt.user_id
            WHERE u.deleted_at IS NULL
            GROUP BY u.id, u.mobile, u.first_name, u.last_name, u.club_id, c.name, c.slug
        ");
    }

    public function down(): void {
        DB::statement('DROP VIEW IF EXISTS user_points_summary');
    }
};