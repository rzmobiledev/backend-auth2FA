import {MfaService} from "./mfa.service";
import {MfaController} from "./mfa.controller";

const mfaService = new MfaService();
const mfaController = new MfaController(mfaService);

export { mfaService, mfaController };