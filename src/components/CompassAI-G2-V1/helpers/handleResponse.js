/* eslint-disable no-unused-vars */
import toast from "react-hot-toast";

// ------------------ HANDLE RESPONSE ------------------
export const handleResponse = async (type, layer, res) => {
    console.log(type);
    console.log(res);
    switch (type) {
        case "crud": {
            let where = res.where;
            let attributes = res.attributes;
            const actionResult = await handleCrudCase(
                res.action,
                layer,
                where,
                attributes
            );
            return actionResult;
        }

        case "calc-field": {
            const actionResult = await handleCalcField(layer, res.calculation);
            return actionResult;
        }

        default:
            return { status: "fail", message: "Unknown action" };
    }
};

// ------------------ HANDLE CRUD ------------------
const handleCrudCase = async (type, layer, where, attributes) => {
    try {
        switch (type) {
            case "update": {
                const query = layer.createQuery();
                query.where = where;
                query.returnGeometry = false;

                const results = await layer.queryFeatures(query);
                if (!results.features.length) {
                    toast("No matching features found for update", {
                        duration: 3000,
                        icon: "⚠️",
                    });
                    return "no-match";
                }

                const updates = results.features.map((f) => ({
                    attributes: { ...f.attributes, ...attributes },
                }));

                await layer.applyEdits({ updateFeatures: updates });
                layer.refresh();
                toast.success(
                    `Successfully updated ${updates.length} feature(s) ✔️`,
                    { duration: 3000 }
                );
                return "update";
            }

            case "delete": {
                const query = layer.createQuery();
                query.where = where;
                query.returnGeometry = false;

                const results = await layer.queryFeatures(query);
                if (!results.features.length) {
                    toast("No matching features found for delete", {
                        duration: 3000,
                        icon: "⚠️",
                    });
                    return "no-match";
                }

                const deletes = results.features.map((f) => ({
                    objectId: f.attributes.OBJECTID,
                }));
                await layer.applyEdits({ deleteFeatures: deletes });
                toast.success(
                    `Successfully deleted ${deletes.length} feature(s) 🗑️`,
                    { duration: 3000 }
                );
                layer.refresh();

                return "delete";
            }

            case "create": {
                const addFeatures = [{ attributes }];
                await layer.applyEdits({ addFeatures });
                toast.success(`Feature created successfully ➕`, {
                    duration: 3000,
                });
                return "create";
            }

            default:
                toast.error("Unknown CRUD action ❗", { duration: 3000 });
                return "unknown-action";
        }
    } catch (err) {
        console.error(err);
        toast.error("An error occurred while processing the request ❌", {
            duration: 3000,
        });
        return "error";
    }
};

// ------------------ HANDLE CALC FIELD ------------------

const handleCalcField = async (layer, calc) => {
    if (!calc || !calc.target_field || (!calc.expression && !calc.code_block)) {
        toast.error("Invalid calculation request", { duration: 3000 });
        return { action: "calculate_field", status: "fail" };
    }

    try {
        // ---------------- Convert where_clause ----------------
        let where = calc.where_clause || "1=1";
        // إزالة أي $feature من where_clause
        where = where.replace(/\$feature\.(\w+)/g, "$1");

        const query = layer.createQuery();
        query.where = where;
        query.returnGeometry = false;

        const features = await layer.queryFeatures(query);

        if (!features.features.length) {
            toast("No matching features found for calculation", {
                duration: 3000,
            });
            return { action: "calculate_field", status: "fail" };
        }

        const updates = features.features.map((f) => {
            let value;

            if (calc.code_block) {
                const func = new Function("$feature", calc.code_block);
                value = func(f.attributes);
            } else {
                let expr = calc.expression;

                // تحويل Replace() من Arcade → JS
                expr = expr.replace(
                    /Replace\(\$feature\.(\w+),\s*['"](.*?)['"],\s*['"](.*?)['"]\)/gi,
                    '($feature["$1"] ? $feature["$1"].replace("$2","$3") : "")'
                );

                // تحويل IIF(condition, trueVal, falseVal) → JS ternary
                expr = expr.replace(
                    /IIF\s*\(\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*\)/gi,
                    "($1 ? $2 : $3)"
                );

                const $feature = f.attributes;
                try {
                    value = eval(expr);
                } catch (err) {
                    console.error("Error evaluating expression:", expr, err);
                    value = null;
                }
            }

            return {
                attributes: { ...f.attributes, [calc.target_field]: value },
            };
        });

        await layer.applyEdits({ updateFeatures: updates });

        toast.success(
            `Field '${calc.target_field}' calculated successfully for ${updates.length} feature(s) ✔️`,
            { duration: 3000 }
        );

        return {
            action: "calculate_field",
            status: "success",
            count: updates.length,
        };
    } catch (err) {
        console.error(err);
        toast.error("Error calculating field ❌", { duration: 3000 });
        return { action: "calculate_field", status: "fail" };
    }
};

export default handleCalcField;
