import React from 'react';

export default function SidebarStyles() {
    return (
        <style>{`
            /* Dot Pattern */
            :root[style*="--sidebar-texture: dots"] .sidebar-texture {
                background-image: radial-gradient(currentColor 1px, transparent 1px);
                background-size: 20px 20px;
            }
            
            /* Lines Pattern */
            :root[style*="--sidebar-texture: lines"] .sidebar-texture {
                background-image: repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%);
                background-size: 10px 10px;
            }

            /* Grid Pattern */
            :root[style*="--sidebar-texture: grid"] .sidebar-texture {
                background-image: linear-gradient(currentColor 1px, transparent 1px),
                linear-gradient(90deg, currentColor 1px, transparent 1px);
                background-size: 20px 20px;
            }

            /* Hex Pattern */
            :root[style*="--sidebar-texture: hex"] .sidebar-texture {
                background-image: url("data:image/svg+xml,%3Csvg width='24' height='40' viewBox='0 0 24 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40c5.523 0 10-4.477 10-10V10c0-5.523-4.477-10-10-10s-10 4.477-10 10v20c0 5.523 4.477 10 10 10z' fill='currentColor' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E");
                background-size: 24px 40px;
            }
            
            /* Waves */
            :root[style*="--sidebar-texture: waves"] .sidebar-texture {
                 background: radial-gradient(circle at 100% 50%, transparent 20%, currentColor 21%, currentColor 34%, transparent 35%, transparent),
                 radial-gradient(circle at 0% 50%, transparent 20%, currentColor 21%, currentColor 34%, transparent 35%, transparent) 0 -50px;
                 background-size: 30px 100px;
            }

            /* --- Real Image Textures --- */

            /* Sea */
            :root[style*="--sidebar-texture: sea"] .sidebar-texture {
                background-image: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80');
                background-size: cover;
                background-position: center;
                opacity: 0.25 !important;
            }

            /* Sunset */
            :root[style*="--sidebar-texture: sunset"] .sidebar-texture {
                background-image: url('https://images.unsplash.com/photo-1472120435266-53107fd0c44a?auto=format&fit=crop&w=600&q=80');
                background-size: cover;
                background-position: center;
                opacity: 0.25 !important;
            }

            /* Space */
            :root[style*="--sidebar-texture: space"] .sidebar-texture {
                background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80');
                background-size: cover;
                background-position: center;
                opacity: 0.3 !important;
            }
            
            /* Forest (Adding a green option) */
            :root[style*="--sidebar-texture: forest"] .sidebar-texture {
                background-image: url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1000&q=80');
                background-size: cover;
                background-position: center;
                opacity: 0.25 !important;
            }
        `}</style>
    );
}