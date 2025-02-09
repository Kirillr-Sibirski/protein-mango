import { http, createConfig } from 'wagmi';
import { flareTestnet } from 'wagmi/chains';

export const config = createConfig({
  chains: [flareTestnet],
  transports: {
    [flareTestnet.id]: http(),
  },
});
