module.exports = [
"[project]/packages/backend/src/modules/cloudinary/services/ensureRootFolders.service.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ROOT_FOLDER_STATUSES",
    ()=>ROOT_FOLDER_STATUSES,
    "ensureRootFolders",
    ()=>ensureRootFolders,
    "isRootFolder",
    ()=>isRootFolder
]);
const ROOT_FOLDER_STATUSES = [
    "pending",
    "published",
    "bin"
];
async function ensureRootFolders(prisma, appRoot) {
    let created = 0;
    for (const status of ROOT_FOLDER_STATUSES){
        const fullPath = `${appRoot}/${status}`;
        const existing = await prisma.cloudinaryFolder.findUnique({
            where: {
                appRoot_fullPath: {
                    appRoot,
                    fullPath
                }
            },
            select: {
                id: true
            }
        });
        if (existing) continue;
        await prisma.cloudinaryFolder.create({
            data: {
                appRoot,
                fullPath,
                status
            }
        });
        created += 1;
    }
    return {
        created,
        total: ROOT_FOLDER_STATUSES.length
    };
}
function isRootFolder(appRoot, fullPath) {
    const normalized = fullPath.replace(/^\/+|\/+$/g, "");
    if (normalized === appRoot) return true;
    for (const status of ROOT_FOLDER_STATUSES){
        if (normalized === `${appRoot}/${status}`) return true;
    }
    return false;
}
}),
];

//# sourceMappingURL=730ea_backend_src_modules_cloudinary_services_ensureRootFolders_service_ts_2d786012._.js.map