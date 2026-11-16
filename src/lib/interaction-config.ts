import {interactionConfig} from './interaction-config.mjs';
export const interactions=interactionConfig({...import.meta.env,CI:import.meta.env.FANSI_CI});
