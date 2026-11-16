import {verificationPublic,closeExpiredWindow} from './verification-window.mjs';
export default {fetch:(req,env)=>verificationPublic(req,env),scheduled:(_event,env,ctx)=>ctx.waitUntil(closeExpiredWindow(env))};
