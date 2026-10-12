export function resolveTenantBrandProductDefaultImageSrc(): string { return ''; }

export function getRuntimePublicEnv(key:string):string { const value=import.meta.env[key];return typeof value==='string'?value:''; }

