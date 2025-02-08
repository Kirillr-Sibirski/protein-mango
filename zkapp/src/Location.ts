import {
    Field,
    SmartContract,
    state,
    State,
    method,
} from 'o1js';

export class Location extends SmartContract {
    events = {
        "receiver-verified": Field,
    };

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

    @method async verifyReceiver(receiver: Field) {
        const getPosition = async () => {
            const position: GeolocationPosition | undefined | null = await new Promise(
                (resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                }
            );
            if (!position) {
                return undefined;
            }

            return {
                x: BigInt(position.coords.longitude * (10 ** 5)),
                y: BigInt(position.coords.latitude * (10 ** 5)),
            };
        };

        const position = await getPosition();
        if (!position) {
            throw ("Geolocation error!");
        }

        const x = new Field(position.x);
        const y = new Field(position.y);

        const dx = x.sub(this.centerX.get());
        const dy = y.sub(this.centerY.get());
        const distanceSquared = dx.mul(dx).add(dy.mul(dy));

        const radius = this.radius.get();
        distanceSquared.assertLessThanOrEqual(
            radius.mul(radius)
        );

        this.emitEvent("receiver-verified", receiver);
    }
}