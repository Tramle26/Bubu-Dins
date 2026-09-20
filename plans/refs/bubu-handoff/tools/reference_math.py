#!/usr/bin/env python3
"""Reference arithmetic for the fictional Bubu fixtures; not a PathMX application.

Run --check to verify golden results and invariants. --write intentionally rewrites
expected-results.json after an approved model change. No network calls are made.
"""
from __future__ import annotations
import argparse
import json
from decimal import Decimal, ROUND_HALF_UP, localcontext
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
D = Decimal
CENT = D('0.01')


def money(value: Decimal) -> Decimal:
    return value.quantize(CENT, rounding=ROUND_HALF_UP)


def cents(value: Decimal) -> int:
    return int(money(value) * 100)


def dollars(value: int) -> Decimal:
    if type(value) is not int:
        raise ValueError('Currency inputs must be integer cents')
    return D(value) / 100


def bps(value: int) -> Decimal:
    if type(value) is not int:
        raise ValueError('Rate inputs must be integer basis points')
    return D(value) / 10000


def mortgage(principal_cents: int, annual_rate_bps: int, term_months: int,
             horizon_months: int) -> dict[str, Any]:
    if (principal_cents < 0 or annual_rate_bps < 0 or
            type(term_months) is not int or term_months <= 0 or
            type(horizon_months) is not int or horizon_months < 0):
        raise ValueError('Invalid mortgage parameters')
    balance = dollars(principal_cents)
    r = bps(annual_rate_bps) / 12
    with localcontext() as ctx:
        ctx.prec = 50
        if balance == 0:
            scheduled = D(0)
        elif r == 0:
            scheduled = money(balance / term_months)
        else:
            scheduled = money(balance * r / (1 - (1 + r) ** (-term_months)))
        rows = []
        for month in range(1, horizon_months + 1):
            opening = balance
            interest = money(opening * r) if opening > 0 else D(0)
            if opening == 0:
                principal = D(0)
            elif month == term_months:
                principal = opening
            else:
                principal = min(opening, scheduled - interest)
            if principal < 0:
                raise ValueError('Payment does not amortize the loan')
            payment = principal + interest
            balance = money(opening - principal)
            rows.append({'month': month, 'opening_cents': cents(opening),
                         'payment_cents': cents(payment), 'interest_cents': cents(interest),
                         'principal_cents': cents(principal), 'balance_cents': cents(balance)})
        return {'scheduled_payment_cents': cents(scheduled), 'rows': rows,
                'remaining_principal_cents': cents(balance),
                'interest_paid_cents': sum(x['interest_cents'] for x in rows),
                'principal_paid_cents': sum(x['principal_cents'] for x in rows)}


def housing(config: dict[str, Any], case: dict[str, Any]) -> dict[str, Any]:
    c = {**config, **case.get('overrides', {})}
    months = case['stay_months']
    down_bps = case['down_payment_bps']
    if type(months) is not int or months <= 0 or not 0 <= down_bps <= 10000:
        raise ValueError('Invalid housing case')
    for key in ('annual_home_growth_bps', 'annual_rent_growth_bps'):
        if c[key] <= -10000:
            raise ValueError('Growth must exceed -100%')
    for key in ('home_price_cents', 'starting_savings_cents', 'monthly_available_cents',
                'initial_rent_cents', 'rental_deposit_cents', 'rental_move_in_fee_cents'):
        if c[key] < 0:
            raise ValueError('Nonnegative amounts required')
    with localcontext() as ctx:
        ctx.prec = 50
        price = dollars(c['home_price_cents'])
        down = money(price * bps(down_bps))
        purchase_cost = money(price * bps(c['purchase_cost_bps']))
        loan = money(price - down)
        result = mortgage(cents(loan), c['annual_interest_bps'], case['term_months'], months)
        buy_cash = dollars(c['starting_savings_cents']) - down - purchase_cost
        rent_cash = (dollars(c['starting_savings_cents']) - dollars(c['rental_deposit_cents'])
                     - dollars(c['rental_move_in_fee_cents']))
        initial_buy_cash, initial_rent_cash = buy_cash, rent_cash
        tax = money(price * bps(c['annual_property_tax_bps']) / 12)
        insurance = money(dollars(c['annual_home_insurance_cents']) / 12)
        maintenance = money(price * bps(c['annual_maintenance_bps']) / 12)
        pmi = money(loan * bps(c['annual_fixture_mortgage_insurance_bps']) / 12) if down_bps < 2000 else D(0)
        rent_insurance = dollars(c['monthly_renters_insurance_cents'])
        monthly_available = dollars(c['monthly_available_cents'])
        min_buy, min_rent = buy_cash, rent_cash
        buy_outflows, rent_outflows = [], []
        for row in result['rows']:
            month = row['month']
            buy_out = (dollars(row['payment_cents']) + tax + insurance + maintenance
                       + (pmi if row['opening_cents'] > 0 else D(0)))
            rent = money(dollars(c['initial_rent_cents']) *
                         (1 + bps(c['annual_rent_growth_bps'])) ** ((month - 1) // 12))
            rent_out = rent + rent_insurance
            buy_cash = money(buy_cash + monthly_available - buy_out)
            rent_cash = money(rent_cash + monthly_available - rent_out)
            min_buy, min_rent = min(min_buy, buy_cash), min(min_rent, rent_cash)
            buy_outflows.append(cents(buy_out))
            rent_outflows.append(cents(rent_out))
        ending_value = money(price * (1 + bps(c['annual_home_growth_bps'])) ** (D(months) / 12))
        selling_cost = money(ending_value * bps(c['sale_cost_bps']))
        balance = dollars(result['remaining_principal_cents'])
        equity = ending_value - balance
        proceeds = equity - selling_cost
        buy_position = buy_cash + proceeds
        rent_position = rent_cash + dollars(c['rental_deposit_cents'])
        return {
            'case_id': case['id'],
            'down_payment_cents': cents(down), 'purchase_cost_cents': cents(purchase_cost),
            'original_principal_cents': cents(loan),
            'scheduled_payment_cents': result['scheduled_payment_cents'],
            'initial_buy_cash_cents': cents(initial_buy_cash), 'initial_rent_cash_cents': cents(initial_rent_cash),
            'first_buy_monthly_outflow_cents': buy_outflows[0],
            'first_rent_monthly_outflow_cents': rent_outflows[0],
            'last_rent_monthly_outflow_cents': rent_outflows[-1],
            'buy_recurring_outflow_cents': sum(buy_outflows),
            'rent_recurring_outflow_cents': sum(rent_outflows),
            'interest_paid_cents': result['interest_paid_cents'],
            'principal_paid_cents': result['principal_paid_cents'],
            'remaining_principal_cents': result['remaining_principal_cents'],
            'ending_home_value_cents': cents(ending_value), 'sale_cost_cents': cents(selling_cost),
            'equity_before_sale_cost_cents': cents(equity), 'net_sale_proceeds_cents': cents(proceeds),
            'buy_liquid_cash_before_sale_cents': cents(buy_cash),
            'rent_cash_before_deposit_return_cents': cents(rent_cash),
            'buy_ending_position_cents': cents(buy_position), 'rent_ending_position_cents': cents(rent_position),
            'minimum_buy_cash_cents': cents(min_buy), 'minimum_rent_cash_cents': cents(min_rent),
            'buy_feasible': min_buy >= 0, 'rent_feasible': min_rent >= 0,
        }


def investing(config: dict[str, Any], allocation: dict[str, Any]) -> dict[str, Any]:
    weights = allocation['allocation_bps']
    assets = config['prices_cents']
    if set(weights) != set(assets) or any(type(v) is not int or not 0 <= v <= 10000 for v in weights.values()):
        raise ValueError('Invalid allocation fields')
    if sum(weights.values()) != 10000:
        raise ValueError('Allocation must total 10,000 basis points')
    lengths = {len(values) for values in assets.values()}
    if len(lengths) != 1 or any(any(type(p) is not int or p <= 0 for p in prices) for prices in assets.values()):
        raise ValueError('Invalid prices')
    with localcontext() as ctx:
        ctx.prec = 50
        units = {k: D(config['budget_cents']) * D(weights[k]) / 10000 / D(assets[k][0]) for k in assets}
        history = [int(sum(units[k] * D(assets[k][t]) for k in assets).quantize(D(1), rounding=ROUND_HALF_UP))
                   for t in range(next(iter(lengths)))]
        peak, drawdown = history[0], D(0)
        for value in history:
            peak = max(peak, value)
            drawdown = max(drawdown, D(peak - value) / D(peak))
        total_return = (D(history[-1]) / D(config['budget_cents']) - 1) * 100
        return {'case_id': allocation['id'], 'history_cents': history,
                'ending_value_cents': history[-1], 'gain_cents': history[-1] - config['budget_cents'],
                'return_percent': str(total_return.quantize(D('0.000001'), rounding=ROUND_HALF_UP)),
                'maximum_drawdown_percent': str((drawdown * 100).quantize(D('0.000001'), rounding=ROUND_HALF_UP))}


def compute_all() -> dict[str, Any]:
    h = json.loads((ROOT / 'fixtures/housing.json').read_text())
    i = json.loads((ROOT / 'fixtures/investing.json').read_text())
    return {'model_version': 'bubu-reference-v1',
            'housing': [housing(h['config'], case) for case in h['cases']],
            'investing': [investing(i, case) for case in i['allocations']],
            'mortgage_kernel': [
                {k: v for k, v in mortgage(20000000, 600, 360, 360).items() if k != 'rows'},
                {k: v for k, v in mortgage(12000000, 0, 120, 120).items() if k != 'rows'},
                {k: v for k, v in mortgage(0, 600, 360, 12).items() if k != 'rows'}]}


def invariants(result: dict[str, Any]) -> None:
    for case in result['housing']:
        assert case['principal_paid_cents'] + case['remaining_principal_cents'] == case['original_principal_cents']
        assert case['buy_ending_position_cents'] == case['buy_liquid_cash_before_sale_cents'] + case['net_sale_proceeds_cents']
    kernel = result['mortgage_kernel']
    assert kernel[0]['scheduled_payment_cents'] == 119910
    assert kernel[0]['remaining_principal_cents'] == 0
    assert kernel[1]['scheduled_payment_cents'] == 100000 and kernel[1]['interest_paid_cents'] == 0
    assert kernel[2]['scheduled_payment_cents'] == 0
    assert result['investing'][0]['history_cents'] == [1000000, 1080000, 876000, 1006000]
    for args in [(-1, 600, 360, 12), (100, -1, 360, 12), (100, 600, 0, 12)]:
        try:
            mortgage(*args)
        except ValueError:
            pass
        else:
            raise AssertionError('Invalid input unexpectedly accepted')


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--check', action='store_true')
    group.add_argument('--write', action='store_true')
    args = parser.parse_args()
    result = compute_all()
    invariants(result)
    expected_path = ROOT / 'fixtures/expected-results.json'
    if args.write:
        expected_path.write_text(json.dumps(result, indent=2) + '\n')
        print(f'Wrote {expected_path}')
    else:
        expected = json.loads(expected_path.read_text())
        if result != expected:
            raise SystemExit('FAIL: reference calculations differ from golden fixtures; inspect changes before rewriting')
        print(f"PASS: {len(result['housing'])} housing cases, {len(result['investing'])} investment cases, 3 mortgage kernels, and invariants")


if __name__ == '__main__':
    main()
