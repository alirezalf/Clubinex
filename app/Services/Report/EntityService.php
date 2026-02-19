<?php

namespace App\Services\Report;

class EntityService
{
    public function __construct(
        private readonly FieldService $fieldService
    ) {}

    public function getEntities(): array
    {
        return [
            'users' => [
                'label' => 'کاربران',
                'fields' => $this->fieldService->getFieldsFor('users')
            ],
            'point_transactions' => [
                'label' => 'تراکنشهای امتیاز',
                'fields' => $this->fieldService->getFieldsFor('point_transactions')
            ],
            'reward_redemptions' => [
                'label' => 'درخواستهای جایزه',
                'fields' => $this->fieldService->getFieldsFor('reward_redemptions')
            ],
            'products' => [
                'label' => 'محصولات',
                'fields' => $this->fieldService->getFieldsFor('products')
            ],
            'product_serials' => [
                'label' => 'سریالهای محصولات',
                'fields' => $this->fieldService->getFieldsFor('product_serials')
            ],
            'surveys' => [
                'label' => 'مسابقات و نظرسنجیها',
                'fields' => $this->fieldService->getFieldsFor('surveys')
            ],
            'survey_answers' => [
                'label' => 'پاسخهای نظرسنجی',
                'fields' => $this->fieldService->getFieldsFor('survey_answers')
            ],
            'tickets' => [
                'label' => 'تیکتهای پشتیبانی',
                'fields' => $this->fieldService->getFieldsFor('tickets')
            ],
            'activity_logs' => [
                'label' => 'لاگ فعالیتها',
                'fields' => $this->fieldService->getFieldsFor('activity_logs')
            ],
        ];
    }

    public function getAllowedTables(): array
    {
        return array_keys($this->getEntities());
    }
}
