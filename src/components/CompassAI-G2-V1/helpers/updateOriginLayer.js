export async function updateOriginLayer(vLayer, mainLayer) {
    if (!vLayer || !mainLayer) throw new Error("Both layers required");
    if (typeof mainLayer.applyEdits !== "function")
        throw new Error("mainLayer does not support applyEdits");

    // جلب Features
    const [vFeatures, mainFeatures] = await Promise.all([
        vLayer.queryFeatures(),
        mainLayer.queryFeatures(),
    ]);

    const mainMap = new Map(
        mainFeatures.features.map((f) => [
            f.attributes[mainLayer.objectIdField],
            f,
        ])
    );

    const edits = {
        addFeatures: [],
        updateFeatures: [],
        deleteFeatures: [],
    };

    for (const vf of vFeatures.features) {
        const id = vf.attributes[vLayer.objectIdField];

        if (id && mainMap.has(id)) {
            // موجود → تحديث
            edits.updateFeatures.push(vf);
            mainMap.delete(id);
        } else {
            // جديد → create a new Feature for server
            const newFeature = {
                geometry: vf.geometry,
                attributes: { ...vf.attributes }, // يمكن إزالة objectId client-side
            };
            delete newFeature.attributes[vLayer.objectIdField]; // مهم
            edits.addFeatures.push(newFeature);
        }
    }

    // أي features متبقية في mainMap → حذف
    edits.deleteFeatures = Array.from(mainMap.values());

    // applyEdits على mainLayer
    await mainLayer.applyEdits(edits);

    // refresh
    mainLayer.refresh();
    return mainLayer;
}
