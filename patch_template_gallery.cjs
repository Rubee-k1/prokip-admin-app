const fs = require('fs');
let code = fs.readFileSync('components/AdminBroadcastsView.tsx', 'utf8');

// 1. Add new states
code = code.replace(
    "const [selectedTemplate, setSelectedTemplate] = useState<any>(null);",
    `const [templates, setTemplates] = useState<any[]>(defaultHtmlTemplates);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [templateModalMode, setTemplateModalMode] = useState<'visual' | 'html' | 'preview'>('preview');
    const [editingTemplateHtml, setEditingTemplateHtml] = useState('');
    const [editingTemplateTitle, setEditingTemplateTitle] = useState('');`
);

// 2. Add handleOpenTemplate
code = code.replace(
    "const renderTemplates = () => (",
    `const handleOpenTemplate = (tpl: any) => {
        setSelectedTemplate(tpl);
        setEditingTemplateHtml(tpl.html);
        setEditingTemplateTitle(tpl.title);
        setTemplateModalMode('preview');
    };

    const handleCreateTemplate = () => {
        const newTpl = {
            id: 'new-' + Date.now(),
            title: 'New Custom Template',
            cat: 'Custom',
            color: 'bg-slate-50',
            html: '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 30px; border: 1px solid #e2e8f0; border-radius: 8px;">  <h2>Hello {{first_name}},</h2>  <p>Start writing your custom template...</p></div>'
        };
        setSelectedTemplate(newTpl);
        setEditingTemplateHtml(newTpl.html);
        setEditingTemplateTitle(newTpl.title);
        setTemplateModalMode('visual');
    };

    const handleSaveTemplate = () => {
        if (!selectedTemplate) return;
        const updated = {
            ...selectedTemplate,
            title: editingTemplateTitle,
            html: editingTemplateHtml
        };
        
        setTemplates(prev => {
            const exists = prev.find(t => t.id === updated.id);
            if (exists) {
                return prev.map(t => t.id === updated.id ? updated : t);
            }
            return [...prev, updated];
        });
        
        setSelectedTemplate(null);
    };

    const renderTemplates = () => (`
);

// 3. Update the renderTemplates array from defaultHtmlTemplates to templates
code = code.replace(
    "{defaultHtmlTemplates.map((tpl) => (",
    "{templates.map((tpl) => ("
);

// 4. Update the "Create Template" button to use handleCreateTemplate
code = code.replace(
    `<button className="bg-[#02275A] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-[#03367A] transition-colors">`,
    `<button onClick={handleCreateTemplate} className="bg-[#02275A] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-[#03367A] transition-colors">`
);

// 5. Update Edit/Preview button to use handleOpenTemplate
code = code.replace(
    `onClick={() => setSelectedTemplate(tpl)} className="bg-white text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 shadow-sm">Edit / Preview</button>`,
    `onClick={() => handleOpenTemplate(tpl)} className="bg-white text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 shadow-sm">Edit / Preview</button>`
);

// 6. Rewrite the selectedTemplate modal content
const modalStart = '{selectedTemplate && (';
const modalEndMarker = ')}        </div>    );';
const mStartIndex = code.indexOf(modalStart);
const mEndIndex = code.indexOf(modalEndMarker, mStartIndex);

if (mStartIndex > -1 && mEndIndex > -1) {
    const replacementStr = `{selectedTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                            <div className="flex-1 max-w-md">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{selectedTemplate.cat}</span>
                                {templateModalMode === 'preview' ? (
                                    <h3 className="text-lg font-bold text-slate-800">{editingTemplateTitle}</h3>
                                ) : (
                                    <input 
                                        type="text" 
                                        value={editingTemplateTitle}
                                        onChange={(e) => setEditingTemplateTitle(e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-lg font-bold text-slate-800 outline-none focus:border-[#02275A]" 
                                    />
                                )}
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="flex bg-slate-200 p-1 rounded-lg">
                                    <button 
                                        onClick={() => setTemplateModalMode('visual')}
                                        className={\`px-3 py-1 rounded text-xs font-bold transition-colors \${templateModalMode === 'visual' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}\`}
                                    >
                                        <i className="fas fa-eye mr-1"></i> Visual Edit
                                    </button>
                                    <button 
                                        onClick={() => setTemplateModalMode('html')}
                                        className={\`px-3 py-1 rounded text-xs font-bold transition-colors \${templateModalMode === 'html' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}\`}
                                    >
                                        <i className="fas fa-code mr-1"></i> HTML Edit
                                    </button>
                                    <button 
                                        onClick={() => setTemplateModalMode('preview')}
                                        className={\`px-3 py-1 rounded text-xs font-bold transition-colors \${templateModalMode === 'preview' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}\`}
                                    >
                                        <i className="fas fa-desktop mr-1"></i> Preview
                                    </button>
                                </div>

                                <button onClick={handleSaveTemplate} className="bg-[#02275A] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-[#03367A] transition-colors">
                                    Save Template
                                </button>
                                <button onClick={() => setSelectedTemplate(null)} className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center justify-center">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex flex-1 overflow-hidden bg-slate-200/50 relative">
                            {templateModalMode === 'html' && (
                                <div className="w-full flex flex-col bg-slate-900">
                                    <div className="p-2 bg-slate-800 text-xs font-bold text-slate-400 flex justify-between uppercase tracking-wider">
                                        <span>Source HTML (Paste your custom HTML here)</span>
                                        <i className="fas fa-code"></i>
                                    </div>
                                    <textarea 
                                        value={editingTemplateHtml}
                                        onChange={(e) => setEditingTemplateHtml(e.target.value)}
                                        className="flex-1 w-full bg-slate-900 text-emerald-400 p-4 font-mono text-sm resize-none outline-none focus:ring-inset focus:ring-1 focus:ring-emerald-500/50"
                                        placeholder="<!-- Type or paste your raw HTML template here -->"
                                        spellCheck={false}
                                    />
                                </div>
                            )}

                            {templateModalMode === 'visual' && (
                                <div className="w-full flex flex-col">
                                    {/* Editor Toolbar */}
                                    <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-1 items-center z-10 shadow-sm">
                                        <button onClick={() => { document.execCommand('bold', false, undefined); document.getElementById('template-visual-editor')?.focus(); }} className="w-8 h-8 rounded hover:bg-slate-200 text-slate-600"><i className="fas fa-bold"></i></button>
                                        <button onClick={() => { document.execCommand('italic', false, undefined); document.getElementById('template-visual-editor')?.focus(); }} className="w-8 h-8 rounded hover:bg-slate-200 text-slate-600"><i className="fas fa-italic"></i></button>
                                        <button onClick={() => { document.execCommand('underline', false, undefined); document.getElementById('template-visual-editor')?.focus(); }} className="w-8 h-8 rounded hover:bg-slate-200 text-slate-600"><i className="fas fa-underline"></i></button>
                                        <div className="w-px h-6 bg-slate-300 mx-1"></div>
                                        <button onClick={() => { document.execCommand('formatBlock', false, 'H1'); document.getElementById('template-visual-editor')?.focus(); }} className="px-2 h-8 rounded hover:bg-slate-200 text-slate-600 text-xs font-bold"><i className="fas fa-heading mr-1"></i> H1</button>
                                        <button onClick={() => { document.execCommand('formatBlock', false, 'P'); document.getElementById('template-visual-editor')?.focus(); }} className="px-2 h-8 rounded hover:bg-slate-200 text-slate-600 text-xs font-bold"><i className="fas fa-paragraph mr-1"></i> Text</button>
                                        <button onClick={() => { const url = prompt('Enter link URL:'); if (url) { document.execCommand('createLink', false, url); document.getElementById('template-visual-editor')?.focus(); } }} className="px-2 h-8 rounded hover:bg-slate-200 text-slate-600 text-xs font-bold"><i className="fas fa-link mr-1"></i> Link</button>
                                        <button onClick={() => { const url = prompt('Enter Image URL:'); if (url) { document.execCommand('insertImage', false, url); document.getElementById('template-visual-editor')?.focus(); } }} className="px-2 h-8 rounded hover:bg-slate-200 text-slate-600 text-xs font-bold"><i className="fas fa-image mr-1"></i> Image</button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 flex justify-center">
                                        <div className="bg-white w-full max-w-2xl border border-slate-200 rounded-lg shadow-sm min-h-full">
                                            <div 
                                                id="template-visual-editor"
                                                contentEditable={true}
                                                suppressContentEditableWarning={true}
                                                onBlur={(e) => setEditingTemplateHtml(e.currentTarget.innerHTML)}
                                                className="w-full min-h-[400px] focus:outline-none p-6 text-slate-800"
                                                dangerouslySetInnerHTML={{ __html: editingTemplateHtml || '<div style="color: #94a3b8;">Start typing...</div>' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {templateModalMode === 'preview' && (
                                <div className="w-full flex flex-col items-center justify-center p-8 overflow-y-auto">
                                    <div className="flex gap-2 mb-4">
                                        <button onClick={() => setTemplatePreviewMode('desktop')} className={\`px-3 py-1 rounded-full text-xs font-bold transition-colors \${templatePreviewMode === 'desktop' ? 'bg-slate-800 text-white' : 'bg-slate-300 text-slate-700'}\`}><i className="fas fa-desktop mr-1"></i> Desktop</button>
                                        <button onClick={() => setTemplatePreviewMode('mobile')} className={\`px-3 py-1 rounded-full text-xs font-bold transition-colors \${templatePreviewMode === 'mobile' ? 'bg-slate-800 text-white' : 'bg-slate-300 text-slate-700'}\`}><i className="fas fa-mobile-screen mr-1"></i> Mobile</button>
                                    </div>
                                    <div className={\`bg-white shadow-lg border border-slate-200 transition-all duration-300 \${templatePreviewMode === 'mobile' ? 'w-[375px] h-[812px] rounded-3xl overflow-hidden shadow-2xl relative border-8 border-slate-800' : 'w-full max-w-2xl min-h-[500px] rounded-xl'}\`}>
                                        {templatePreviewMode === 'mobile' && (
                                            <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 flex justify-center rounded-t-xl z-10">
                                                <div className="w-32 h-4 bg-black rounded-b-xl"></div>
                                            </div>
                                        )}
                                        <div 
                                            className={\`w-full h-full bg-white \${templatePreviewMode === 'mobile' ? 'pt-8' : ''}\`}
                                            dangerouslySetInnerHTML={{ __html: editingTemplateHtml }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}`;
    
    code = code.substring(0, mStartIndex) + replacementStr + '\n' + code.substring(mEndIndex);
    fs.writeFileSync('components/AdminBroadcastsView.tsx', code);
    console.log("Template gallery patched successfully.");
} else {
    console.log("Could not find modal start/end markers.");
}
