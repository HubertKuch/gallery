import useAlbumStore from '../stores/albumStore';
import { convertFileSrc } from "@tauri-apps/api/core";
import { useMemo } from 'react';

const MainContent = () => {
    const { currentAlbum, currentAlbumImages } = useAlbumStore();

    const imageUrls = useMemo(() => {
        return currentAlbumImages.map(imagePath => convertFileSrc(imagePath));
    }, [currentAlbumImages]);

    return (
        <main className="flex-1 p-4 overflow-y-auto max-h-[calc(100%-3rem)]">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold">{currentAlbum ? currentAlbum.name : 'Select an album'}</h2>
                </div>
                <div>
                    <button className="btn btn-ghost">Select</button>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

                {imageUrls.map((imageUrl, i) => (
                    <div key={i} className="aspect-square bg-base-300 rounded-lg">

                        {/* 4. Use the pre-converted URL and add loading="lazy" */}
                        <img
                            src={imageUrl}
                            alt=""
                            className="w-full h-full object-cover rounded-lg"
                            loading="lazy"
                        />
                    </div>
                ))}
            </div>
            {import.meta.env.DEV && <p className="text-xs text-base-content/50 mt-4">Running in development mode.</p>}
        </main>
    );
};

export default MainContent;