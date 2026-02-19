import React from 'react';
import { useForm } from '@inertiajs/react';
import { X, Upload } from 'lucide-react';

export default function ImportSerialsModal({ isOpen, onClose, selectedProduct }: any) {
    if (!isOpen || !selectedProduct) return null;

    const { data: importData, setData: setImportData, post: postImport, processing: importProcessing, reset: resetImport } = useForm({
        file: null as File | null,
    });

    const submitImport = (e: React.FormEvent) => {
        e.preventDefault();
        postImport(route('admin.products.import_serials', selectedProduct.id), {
            onSuccess: () => {
                onClose();
                resetImport();
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg">وارد کردن سریال‌ها از اکسل</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={submitImport} className="p-6 space-y-4">
                    <p className="text-sm text-gray-500">برای محصول: <span className="font-bold">{selectedProduct?.title}</span></p>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer relative bg-gray-50/50">
                        <input 
                            type="file" 
                            onChange={e => setImportData('file', e.target.files ? e.target.files[0] : null)} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept=".xlsx,.xls,.csv"
                        />
                        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">فایل اکسل را اینجا رها کنید یا کلیک کنید</p>
                        {importData.file && <p className="text-primary-600 mt-2 font-bold">{importData.file.name}</p>}
                    </div>
                    <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded text-center">فایل اکسل باید دارای یک ستون با هدر <code>serial_code</code> باشد.</p>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">انصراف</button>
                        <button type="submit" disabled={importProcessing || !importData.file} className="px-6 py-2 bg-green-600 text-white rounded-xl shadow-lg">آپلود</button>
                    </div>
                </form>
            </div>
        </div>
    );
}