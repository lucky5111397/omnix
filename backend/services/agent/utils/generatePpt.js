import pptxgen from "pptxgenjs";

export const generatePpt = async (data) => {
    const pptx = new pptxgen();

    pptx.layout = "LAYOUT_WIDE";
    pptx.author = "Omnix";
    pptx.company = "Omnix";
    pptx.subject = data.subtitle || data.title;
    pptx.title = data.title || "Generated Presentation";
    pptx.lang = "en-US";

    // =========================
    // TITLE SLIDE
    // =========================

    let slide = pptx.addSlide();

    slide.background = {
        color: "111827",
    };

    slide.addText(data.title || "Generated Presentation", {
        x: 1,
        y: 2.3,
        w: 11.3,
        h: 0.8,
        fontSize: 30,
        bold: true,
        color: "FFFFFF",
        align: "center",
        margin: 0,
    });

    slide.addText(data.subtitle || "", {
        x: 1.5,
        y: 3.3,
        w: 10.3,
        h: 0.7,
        fontSize: 18,
        color: "D1D5DB",
        align: "center",
        margin: 0,
    });

    // =========================
    // CONTENT SLIDES
    // =========================

    for (const item of data.slides || []) {
        slide = pptx.addSlide();

        slide.background = {
            color: "F8FAFC",
        };

        slide.addText(item.title || "Untitled", {
            x: 0.7,
            y: 0.5,
            w: 11.8,
            h: 0.6,
            fontSize: 26,
            bold: true,
            color: "111827",
            margin: 0,
        });

        const bulletText = (item.points || []).map((point) => ({
            text: String(point),
            options: {
                bullet: {
                    indent: 18,
                },
            },
        }));

        slide.addText(bulletText, {
            x: 0.9,
            y: 1.5,
            w: 11.2,
            h: 4.8,
            fontSize: 20,
            color: "374151",
            breakLine: true,
            paraSpaceAfterPt: 14,
            valign: "top",
            margin: 0.05,
        });
    }

    // Return actual PPTX buffer
    const buffer = await pptx.write({
        outputType: "nodebuffer",
    });

    return buffer;
};