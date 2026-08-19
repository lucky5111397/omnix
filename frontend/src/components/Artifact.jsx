import React, { useMemo, useState } from "react";
import {
    Code2,
    Copy,
    Eye,
    Minus,
    Monitor,
    PanelRightClose,
    PanelRightOpen,
    Plus,
    RefreshCw,
    Smartphone,
    Tablet,
    X,
} from "lucide-react";
import { motion } from "motion/react";
import { useSelector } from "react-redux";
import Editor from "@monaco-editor/react";

function Artifact() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [tab, setTab] = useState("code");
    const [copied, setCopied] = useState(false);
    const [selectedFile, setSelectedFile] = useState("index.html");
    const [previewDevice, setPreviewDevice] = useState("desktop");
    const [previewZoom, setPreviewZoom] = useState(100);
    const [previewKey, setPreviewKey] = useState(0);

    const { artifacts } = useSelector((state) => state.message);

    const currentArtifact = artifacts?.[0];
    const files = currentArtifact?.files || [];

    const htmlFile = files.find((file) => file.name === "index.html");
    const cssFile = files.find((file) => file.name === "style.css");
    const jsFile = files.find((file) => file.name === "script.js");

    const activeFile =
        files.find((file) => file.name === selectedFile) || files[0];

    const canPreview = Boolean(htmlFile);

    const previewDoc = useMemo(() => {
        if (!htmlFile) return "";

        let html = htmlFile.content || "";

        const injectHead = (content) => {
            if (html.includes("</head>")) {
                html = html.replace("</head>", `${content}</head>`);
            } else {
                html = `${content}${html}`;
            }
        };

        const injectBody = (content) => {
            if (html.includes("</body>")) {
                html = html.replace("</body>", `${content}</body>`);
            } else {
                html += content;
            }
        };

        injectHead(`
            <style>
                html {
                    width: 100%;
                    min-height: 100%;
                    margin: 0;
                    padding: 0;
                    overflow-x: hidden !important;
                    overflow-y: auto !important;
                }

                body {
                    width: 100%;
                    min-height: 100%;
                    margin: 0;
                    padding: 0;
                    overflow-x: hidden !important;
                    overflow-y: auto !important;
                }

                * {
                    box-sizing: border-box;
                }
            </style>
        `);

        if (cssFile?.content) {
            injectHead(`
                <style>
                    ${cssFile.content}
                </style>
            `);
        }

        if (jsFile?.content) {
            injectBody(`
                <script>
                    ${jsFile.content}
                </script>
            `);
        }

        return html;
    }, [htmlFile, cssFile, jsFile]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(activeFile?.content || "");
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (error) {
            console.error("Copy failed:", error);
        }
    };

    const handleFileSelect = (fileName) => {
        setSelectedFile(fileName);
        setCopied(false);
    };

    const handleZoomOut = () => {
        setPreviewZoom((prev) => Math.max(50, prev - 10));
    };

    const handleZoomIn = () => {
        setPreviewZoom((prev) => Math.min(150, prev + 10));
    };

    const handleResetZoom = () => {
        setPreviewZoom(100);
    };

    const handleRefreshPreview = () => {
        setPreviewKey((prev) => prev + 1);
    };

    const previewWidths = {
        mobile: "375px",
        tablet: "768px",
        desktop: "100%",
    };

    const previewWidth = previewWidths[previewDevice] || "100%";

    const deviceButtons = [
        {
            id: "desktop",
            icon: Monitor,
            label: "Desktop",
        },
        {
            id: "tablet",
            icon: Tablet,
            label: "Tablet",
        },
        {
            id: "mobile",
            icon: Smartphone,
            label: "Mobile",
        },
    ];

    const editorLanguage = activeFile?.name?.endsWith(".css")
        ? "css"
        : activeFile?.name?.endsWith(".js")
            ? "javascript"
            : "html";

    if (!artifacts?.length) {
        return null;
    }

    return (
        <>
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-3.5 right-4 z-[60] flex items-center justify-center w-8 h-8 rounded-lg bg-[#0d0f14] border border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
                <PanelRightOpen size={14} />
            </button>

            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
                />
            )}

            <motion.div
                initial={false}
                animate={{
                    width: collapsed ? 48 : 400,
                    x: mobileOpen ? 0 : 0,
                }}
                transition={{
                    duration: 0.25,
                    ease: "easeInOut",
                }}
                className={`
                    fixed
                    top-0
                    right-0
                    z-[80]
                    h-screen
                    bg-[#0d0f14]
                    border-l
                    border-white/[0.06]
                    overflow-hidden
                    shrink-0
                    w-full
                    lg:relative
                    lg:h-full
                    lg:w-[400px]
                    lg:flex
                    lg:flex-col
                    ${mobileOpen
                        ? "translate-x-0"
                        : "translate-x-full lg:translate-x-0"
                    }
                `}
            >
                {collapsed ? (
                    <div className="hidden lg:flex h-full w-full bg-[#0d0f14] flex-col items-center py-4 gap-3">
                        <button
                            onClick={() => setCollapsed(false)}
                            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors bg-transparent border-none cursor-pointer"
                        >
                            <PanelRightOpen size={16} />
                        </button>

                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div
                                className="text-[10px] font-medium text-slate-600 tracking-widest uppercase whitespace-nowrap"
                                style={{
                                    writingMode: "vertical-lr",
                                    transform: "rotate(180deg)",
                                }}
                            >
                                {currentArtifact?.title}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col w-full h-full min-h-0 bg-[#0d0f14]">
                        <div className="h-14 px-4 border-b border-white/[0.06] flex items-center gap-3 shrink-0">
                            <button
                                onClick={() => setCollapsed(true)}
                                className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors bg-transparent border-none cursor-pointer"
                            >
                                <PanelRightClose size={16} />
                            </button>

                            <button
                                onClick={() => setMobileOpen(false)}
                                className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors bg-transparent border-none cursor-pointer"
                            >
                                <X size={17} />
                            </button>

                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                                    <Code2
                                        size={12}
                                        className="text-indigo-400"
                                    />
                                </div>

                                <div className="text-[13px] font-medium text-slate-200 truncate">
                                    {currentArtifact?.title}
                                </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={() => setTab("code")}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${tab === "code"
                                            ? "bg-indigo-500 text-white"
                                            : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]"
                                        }`}
                                >
                                    <Code2 size={11} />
                                    Code
                                </button>

                                <button
                                    onClick={() =>
                                        canPreview && setTab("preview")
                                    }
                                    disabled={!canPreview}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${tab === "preview"
                                            ? "bg-indigo-500 text-white"
                                            : canPreview
                                                ? "text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]"
                                                : "text-slate-700 cursor-not-allowed"
                                        }`}
                                >
                                    <Eye size={11} />
                                    Preview
                                </button>

                                <button
                                    onClick={handleCopy}
                                    className="flex items-center justify-center w-7 h-7 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors bg-transparent border-none cursor-pointer"
                                    title={copied ? "Copied" : "Copy"}
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 overflow-hidden">
                            {tab === "code" ? (
                                <motion.div
                                    key="code"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full w-full flex flex-col min-h-0"
                                >
                                    <div className="h-10 shrink-0 border-b border-white/[0.06] flex items-center gap-1 px-3 overflow-x-auto">
                                        {files.map((file, index) => (
                                            <button
                                                key={`${file.name}-${index}`}
                                                onClick={() =>
                                                    handleFileSelect(file.name)
                                                }
                                                className={`px-2.5 py-1.5 text-[11px] rounded-md whitespace-nowrap transition-colors ${selectedFile === file.name
                                                        ? "bg-white/[0.08] text-slate-200"
                                                        : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
                                                    }`}
                                            >
                                                {file.name}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex-1 min-h-0 overflow-hidden">
                                        <Editor
                                            height="100%"
                                            width="100%"
                                            language={editorLanguage}
                                            theme="vs-dark"
                                            value={activeFile?.content || ""}
                                            options={{
                                                minimap: {
                                                    enabled: false,
                                                },
                                                fontSize: 12,
                                                lineNumbers: "on",
                                                wordWrap: "on",
                                                automaticLayout: true,
                                                scrollBeyondLastLine: false,
                                                padding: {
                                                    top: 12,
                                                },
                                                renderWhitespace:
                                                    "selection",
                                                smoothScrolling: true,
                                                cursorBlinking: "smooth",
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="preview"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="w-full h-full flex flex-col bg-[#090b10] min-h-0"
                                >
                                    <div className="h-11 shrink-0 px-3 flex items-center justify-between border-b border-white/[0.06] bg-[#0d0f14]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />

                                            <span className="text-[11px] text-slate-400 font-medium">
                                                Live Preview
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {deviceButtons.map(
                                                ({
                                                    id,
                                                    icon: Icon,
                                                    label,
                                                }) => (
                                                    <button
                                                        key={id}
                                                        onClick={() =>
                                                            setPreviewDevice(id)
                                                        }
                                                        title={label}
                                                        className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${previewDevice === id
                                                                ? "text-indigo-400 bg-indigo-500/10"
                                                                : "text-slate-600 hover:text-slate-300 hover:bg-white/[0.04]"
                                                            }`}
                                                    >
                                                        <Icon size={13} />
                                                    </button>
                                                )
                                            )}

                                            <div className="w-px h-4 bg-white/[0.08] mx-1" />

                                            <button
                                                onClick={handleZoomOut}
                                                className="flex items-center justify-center w-7 h-7 rounded-md text-slate-600 hover:text-slate-300 hover:bg-white/[0.04]"
                                            >
                                                <Minus size={12} />
                                            </button>

                                            <button
                                                onClick={handleResetZoom}
                                                className="min-w-[38px] h-7 px-1 rounded-md text-[10px] text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
                                            >
                                                {previewZoom}%
                                            </button>

                                            <button
                                                onClick={handleZoomIn}
                                                className="flex items-center justify-center w-7 h-7 rounded-md text-slate-600 hover:text-slate-300 hover:bg-white/[0.04]"
                                            >
                                                <Plus size={12} />
                                            </button>

                                            <button
                                                onClick={handleRefreshPreview}
                                                className="flex items-center justify-center w-7 h-7 rounded-md text-slate-600 hover:text-slate-300 hover:bg-white/[0.04] ml-1"
                                            >
                                                <RefreshCw size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-h-0 overflow-auto bg-[#090b10] p-3">
                                        {canPreview ? (
                                            <div className="w-full h-full flex justify-center items-start">
                                                <motion.div
                                                    key={`${previewDevice}-${previewKey}`}
                                                    initial={{
                                                        opacity: 0,
                                                        scale: 0.98,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: 1,
                                                    }}
                                                    className="relative shrink-0 rounded-xl overflow-hidden border border-white/[0.08] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
                                                    style={{
                                                        width: previewWidth,
                                                        height: "100%",
                                                        maxWidth: "100%",
                                                    }}
                                                >
                                                    <div
                                                        className="w-full h-full"
                                                        style={{
                                                            transform: `scale(${previewZoom / 100})`,
                                                            transformOrigin:
                                                                "center center",
                                                        }}
                                                    >
                                                        <iframe
                                                            key={previewKey}
                                                            title="Artifact Preview"
                                                            srcDoc={previewDoc}
                                                            className="w-full h-full border-0 bg-white"
                                                            sandbox="allow-scripts"
                                                            scrolling="yes"
                                                        />
                                                    </div>
                                                </motion.div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
                                                <div className="text-center">
                                                    <div className="text-sm text-slate-500">
                                                        Preview is not available
                                                    </div>

                                                    <div className="text-[11px] text-slate-600 mt-1">
                                                        Generate an index.html file to
                                                        preview
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </>
    );
}

export default Artifact;