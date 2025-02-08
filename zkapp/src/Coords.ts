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
        const centerX = this.centerX.get();
        this.centerX.requireEquals(centerX);

        const centerY = this.centerY.get();
        this.centerY.requireEquals(centerY);

        const dx = x.sub(centerX);
        const dy = y.sub(centerY);
        const distanceSquared = dx.mul(dx).add(dy.mul(dy));

        const radius = this.radius.get();
        this.radius.requireEquals(radius);

        distanceSquared.assertLessThanOrEqual(
            radius.mul(radius)
        );

        this.emitEvent("account-verified", account);
    }
}