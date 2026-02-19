<?php

namespace App\Services\Report;

use Illuminate\Database\Query\Builder;

class AdvancedFilterService
{
    public function apply(Builder $query, array $filters, array $validFields): void
    {
        foreach ($filters as $filter) {
            $this->applySingleFilter($query, $filter, $validFields);
        }
    }

    private function applySingleFilter(Builder $query, array $filter, array $validFields): void
    {
        if (!isset($filter['field']) || !isset($filter['operator']) || !isset($filter['value'])) {
            return;
        }

        if (!in_array($filter['field'], $validFields) && $filter['field'] !== 'id') {
            return;
        }

        $field = $filter['field'];
        $value = $filter['value'];

        switch ($filter['operator']) {
            case 'contains':
                $query->where($field, 'LIKE', "%{$value}%");
                break;

            case 'not_contains':
                $query->where($field, 'NOT LIKE', "%{$value}%");
                break;

            case 'equals':
                $query->where($field, '=', $value);
                break;

            case 'not_equals':
                $query->where($field, '!=', $value);
                break;

            case 'starts_with':
                $query->where($field, 'LIKE', "{$value}%");
                break;

            case 'ends_with':
                $query->where($field, 'LIKE', "%{$value}");
                break;

            case 'greater_than':
                $query->where($field, '>', $value);
                break;

            case 'less_than':
                $query->where($field, '<', $value);
                break;

            case 'greater_than_or_equal':
                $query->where($field, '>=', $value);
                break;

            case 'less_than_or_equal':
                $query->where($field, '<=', $value);
                break;

            case 'between':
                if (is_array($value) && count($value) === 2) {
                    $query->whereBetween($field, $value);
                }
                break;

            case 'in':
                if (is_array($value)) {
                    $query->whereIn($field, $value);
                }
                break;

            case 'not_in':
                if (is_array($value)) {
                    $query->whereNotIn($field, $value);
                }
                break;

            case 'is_null':
                $query->whereNull($field);
                break;

            case 'is_not_null':
                $query->whereNotNull($field);
                break;
        }
    }
}
