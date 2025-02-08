import {
    Field,
    SmartContract,
    state,
    State,
    method,
} from 'o1js';

export class Location extends SmartContract {
    @state(Field) receiver = State<Field>();

    @state(Field) centerX = State<Field>();
    @state(Field) centerY = State<Field>();
    @state(Field) radius = State<Field>();

    @method async initLocation(
        centerX: Field,
        centerY: Field,
        radius: Field,
    ) {
        super.init();

        this.centerX.set(centerX);
        this.centerY.set(centerY);
        this.radius.set(radius);
    }

    @method async setReceiver(receiver: Field) {
        // TODO: Get lat and long
        const x = new Field(0);
        const y = new Field(0);

        const dx = x.sub(this.centerX.get());
        const dy = y.sub(this.centerY.get());
        const distanceSquared = dx.mul(dx).add(dy.mul(dy));

        const radius = this.radius.get();
        distanceSquared.assertLessThanOrEqual(
            radius.mul(radius)
        );

        this.receiver.set(receiver);
    }
}