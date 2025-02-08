import {
    Field,
    SmartContract,
    state,
    State,
    method,
} from 'o1js';

export class Coords extends SmartContract {
    events = {
        "account-verified": Field,
    };

    @state(Field) centerX = State<Field>();
    @state(Field) centerY = State<Field>();
    @state(Field) radius = State<Field>();

    @method async initialize(
        centerX: Field,
        centerY: Field,
        radius: Field,
    ) {
        super.init();

        this.centerX.set(centerX);
        this.centerY.set(centerY);
        this.radius.set(radius);
    }

    @method async verifyCoords(x: Field, y: Field, account: Field) {
        const dx = x.sub(this.centerX.get());
        const dy = y.sub(this.centerY.get());
        const distanceSquared = dx.mul(dx).add(dy.mul(dy));

        const radius = this.radius.get();
        distanceSquared.assertLessThanOrEqual(
            radius.mul(radius)
        );

        this.emitEvent("account-verified", account);
    }
}