import Point from "@arcgis/core/geometry/Point";
import Polygon from "@arcgis/core/geometry/Polygon";
import Polyline from "@arcgis/core/geometry/Polyline";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";

// --------------------------- LandMark ---------------------------
export async function getLandmarksData(view, params) {
    try {
        const { location, radius } = params;
        let [lat, lng] = location.split(",").map(Number);

        console.log(
            `📍 Using center: lat=${lat}, lon=${lng}, radius=${radius}m`
        );

        // 🔹 استعلام محسن يرجع أماكن مفيدة فقط (ليست مباني عادية)
        const query = `
[out:json][timeout:45];
(
  // 🏥 المرافق والخدمات (مستشفيات، بنوك، مدارس)
  node["amenity"~"hospital|clinic|pharmacy|bank|atm|police|fire_station|post_office"](around:${radius},${lat},${lng});
  way["amenity"~"hospital|clinic|pharmacy|bank|atm|police|fire_station|post_office"](around:${radius},${lat},${lng});
  
  // 🍽️ المطاعم والمقاهي
  node["amenity"~"restaurant|cafe|fast_food|bar|pub|ice_cream"](around:${radius},${lat},${lng});
  way["amenity"~"restaurant|cafe|fast_food|bar|pub|ice_cream"](around:${radius},${lat},${lng});
  
  // 🛒 المحلات التجارية
  node["shop"~"supermarket|mall|convenience|bakery|butcher|clothes|shoes|electronics"](around:${radius},${lat},${lng});
  way["shop"~"supermarket|mall|convenience|bakery|butcher|clothes|shoes|electronics"](around:${radius},${lat},${lng});
  
  // 🏨 السياحة والفنادق
  node["tourism"~"hotel|hostel|guest_house|attraction|museum|viewpoint"](around:${radius},${lat},${lng});
  way["tourism"~"hotel|hostel|guest_house|attraction|museum|viewpoint"](around:${radius},${lat},${lng});
  
  // 🏛️ أماكن العبادة والمعالم التاريخية
  node["amenity"~"place_of_worship"](around:${radius},${lat},${lng});
  way["amenity"~"place_of_worship"](around:${radius},${lat},${lng});
  node["historic"~"monument|memorial|castle|fort"](around:${radius},${lat},${lng});
  way["historic"~"monument|memorial|castle|fort"](around:${radius},${lat},${lng});
  
  // ⛽ محطات الوقود
  node["amenity"~"fuel"](around:${radius},${lat},${lng});
  way["amenity"~"fuel"](around:${radius},${lat},${lng});
  
  // 🚌 مواقف الباصات
  node["highway"~"bus_stop"](around:${radius},${lat},${lng});
  
  // 🏫 المدارس والجامعات
  node["amenity"~"school|university|college|kindergarten"](around:${radius},${lat},${lng});
  way["amenity"~"school|university|college|kindergarten"](around:${radius},${lat},${lng});
  
  // 🏢 مبانٍ مهمة (مكاتب، حكومية)
  node["office"](around:${radius},${lat},${lng});
  way["office"](around:${radius},${lat},${lng});
  node["building"~"university|school|hospital|mosque|church|train_station|office"](around:${radius},${lat},${lng});
  way["building"~"university|school|hospital|mosque|church|train_station|office"](around:${radius},${lat},${lng});
);
(._;>;);
out center;
`;

        console.log("🌐 Sending optimized Overpass query...");
        const response = await fetch(
            "https://overpass-api.de/api/interpreter",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `data=${encodeURIComponent(query)}`,
            }
        );

        const data = await response.json();
        console.log(
            "✅ Overpass response - Elements found:",
            data.elements?.length
        );

        if (!data.elements?.length) {
            console.warn("⚠️ No meaningful landmarks found in this area.");

            // عرض رسالة للمستخدم
            view.popup.open({
                title: "لا توجد معالم",
                content:
                    "لم يتم العثور على معالم مميزة في النطاق المحدد. حاول زيادة نصف القطر أو اختيار موقع مختلف.",
                location: new Point({ longitude: lng, latitude: lat }),
            });
            return [];
        }

        // 🔹 فلترة العناصر التي لديها أسماء أو أنواع محددة
        const meaningfulElements = data.elements.filter((element) => {
            const tags = element.tags || {};

            // نأخذ العناصر التي لها اسم أو نوع محدد
            return (
                tags.name ||
                tags.amenity ||
                tags.shop ||
                tags.tourism ||
                tags.historic ||
                tags.office ||
                (tags.building && tags.building !== "yes") || // مبانٍ محددة وليست مجرد 'yes'
                tags.highway === "bus_stop"
            );
        });

        console.log(
            "🎯 Meaningful elements after filtering:",
            meaningfulElements.length
        );

        if (meaningfulElements.length === 0) {
            console.warn("⚠️ No elements with meaningful information found.");
            return [];
        }

        // 🔹 إزالة الطبقة القديمة
        const oldLayer = view.map.findLayerById("landmarksLayer");
        if (oldLayer) view.map.remove(oldLayer);

        const graphicsLayer = new GraphicsLayer({
            id: "landmarksLayer",
            title: "العلامات المميزة",
            listMode: "show",
        });
        view.map.add(graphicsLayer);

        // 🔹 معالجة البيانات وعرضها
        processAndDisplayLandmarks(
            meaningfulElements,
            graphicsLayer,
            view,
            lat,
            lng
        );

        return meaningfulElements;
    } catch (err) {
        console.error("❌ Error in getLandmarksData:", err);

        // عرض رسالة خطأ للمستخدم
        view.popup.open({
            title: "خطأ في جلب البيانات",
            content: "حدث خطأ أثناء جلب المعالم. حاول مرة أخرى.",
            location: view.center,
        });

        return [];
    }
}

// 🔹 دالة محسنة لمعالجة وعرض المعالم
function processAndDisplayLandmarks(
    elements,
    graphicsLayer,
    view,
    centerLat,
    centerLng
) {
    const nodeMap = {};

    // إنشاء خريطة العقد
    elements
        .filter((el) => el.type === "node")
        .forEach((node) => {
            nodeMap[node.id] = { lon: node.lon, lat: node.lat };
        });

    let featuresAdded = 0;
    const categories = {};

    elements.forEach((place) => {
        const tags = place.tags || {};
        const name = tags.name || "غير معروف";
        const type = getPlaceType(tags);

        // تتبع الإحصائيات
        categories[type] = (categories[type] || 0) + 1;

        let geometry = null;
        let symbol = null;

        // 🔹 تحديد الشكل واللون حسب النوع
        const symbolInfo = getSymbolForType(type);

        if (place.type === "node") {
            // نقطة مباشرة
            geometry = new Point({
                longitude: place.lon,
                latitude: place.lat,
            });
            symbol = symbolInfo.point;
        } else if (place.type === "way" && place.center) {
            // way به مركز
            geometry = new Point({
                longitude: place.center.lon,
                latitude: place.center.lat,
            });
            symbol = symbolInfo.point;
        } else if (place.type === "way" && place.nodes) {
            // way بدون مركز
            const coords = place.nodes
                .map((nodeId) => nodeMap[nodeId])
                .filter(Boolean)
                .map((node) => [node.lon, node.lat]);

            if (coords.length > 0) {
                if (tags.building || tags.landuse) {
                    geometry = new Polygon({ rings: [coords] });
                    symbol = symbolInfo.polygon;
                } else {
                    geometry = new Polyline({ paths: [coords] });
                    symbol = symbolInfo.line;
                }
            }
        }

        // 🔹 إضافة الرسم إذا كان هناك geometry صالح
        if (geometry) {
            const popupContent = createPopupContent(name, type, tags, place.id);

            const graphic = new Graphic({
                geometry: geometry,
                symbol: symbol,
                attributes: {
                    name: name,
                    type: type,
                    id: place.id,
                    ...tags,
                },
                popupTemplate: {
                    title: "{name}",
                    content: popupContent,
                },
            });

            graphicsLayer.add(graphic);
            featuresAdded++;
        }
    });

    console.log(`🎯 Added ${featuresAdded} meaningful landmarks`);
    console.log("📊 Categories breakdown:", categories);

    // 🔹 التكبير على المعالم إذا كانت موجودة
    if (featuresAdded > 0 && graphicsLayer.graphics.length > 0) {
        view.goTo(graphicsLayer.graphics).catch(() => {
            // إذا فشل التكبير، نعود للمركز الأصلي
            view.goTo({
                center: [centerLng, centerLat],
                zoom: 14,
            });
        });

        // عرض إشعار بعدد المعالم
        view.popup.open({
            title: "تم العثور على المعالم",
            content: `تم العثور على ${featuresAdded} معلم في المنطقة.<br>${Object.entries(
                categories
            )
                .map(([cat, count]) => `${cat}: ${count}`)
                .join("<br>")}`,
            location: new Point({ longitude: centerLng, latitude: centerLat }),
        });
    }
}

// 🔹 دالة تحديد نوع المكان
function getPlaceType(tags) {
    if (tags.amenity) {
        const amenityTypes = {
            restaurant: "مطعم",
            cafe: "مقهى",
            bank: "بنك",
            hospital: "مستشفى",
            pharmacy: "صيدلية",
            school: "مدرسة",
            university: "جامعة",
            police: "شرطة",
            fuel: "محطة وقود",
            place_of_worship: "مكان عبادة",
        };
        return amenityTypes[tags.amenity] || tags.amenity;
    }
    if (tags.shop) return "متجر " + tags.shop;
    if (tags.tourism) return "معلم سياحي";
    if (tags.historic) return "معلم تاريخي";
    if (tags.office) return "مكتب";
    if (tags.building && tags.building !== "yes")
        return "مبنى " + tags.building;
    if (tags.highway === "bus_stop") return "موقف باص";

    return "معلم";
}

// 🔹 دالة إنشاء الرموز
function getSymbolForType(type) {
    const colorMap = {
        مطعم: "red",
        مقهى: "brown",
        بنك: "darkgreen",
        مستشفى: "green",
        صيدلية: "lightgreen",
        مدرسة: "blue",
        جامعة: "darkblue",
        متجر: "purple",
        "معلم سياحي": "orange",
        "معلم تاريخي": "darkred",
        "محطة وقود": "black",
        "مكان عبادة": "gold",
        مكتب: "gray",
    };

    const color = colorMap[type] || "orange";

    return {
        point: {
            type: "simple-marker",
            color: color,
            size: "10px",
            outline: { color: "white", width: 2 },
        },
        polygon: {
            type: "simple-fill",
            color: [
                parseInt(color.slice(1, 3), 16),
                parseInt(color.slice(3, 5), 16),
                parseInt(color.slice(5, 7), 16),
                0.3,
            ],
            outline: { color: color, width: 2 },
        },
        line: {
            type: "simple-line",
            color: color,
            width: 3,
        },
    };
}

// 🔹 دالة إنشاء محتوى الـ Popup
function createPopupContent(name, type, tags, id) {
    let content = `<b>النوع:</b> ${type}<br>`;
    content += `<b>المعرف:</b> ${id}<br>`;

    if (tags.amenity) content += `<b>الخدمة:</b> ${tags.amenity}<br>`;
    if (tags.shop) content += `<b>نوع المتجر:</b> ${tags.shop}<br>`;
    if (tags.cuisine) content += `<b>المطبخ:</b> ${tags.cuisine}<br>`;
    if (tags["addr:street"])
        content += `<b>الشارع:</b> ${tags["addr:street"]}<br>`;
    if (tags["opening_hours"])
        content += `<b>ساعات العمل:</b> ${tags["opening_hours"]}<br>`;

    return content;
}
