import useAlbumStore from '../stores/albumStore';
import { convertFileSrc } from "@tauri-apps/api/core";
import { useMemo } from 'react';

const ImageSkeleton = () => (
    <div className="skeleton aspect-square bg-base-300 rounded-lg"></div>
);

const MainContent = () => {
    const {
        currentAlbum,
        currentAlbumThumbnails,
        isLoadingThumbnails,
        imageCount
    } = useAlbumStore();

    const imageUrls = useMemo(() => {
        if (!currentAlbumThumbnails) {
            return [];
        }
        return currentAlbumThumbnails.map(imagePath => convertFileSrc(imagePath));
    }, [currentAlbumThumbnails]);

    const skeletonCount = imageCount - imageUrls.length;

    return (
        <main className="flex-1 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{currentAlbum ? currentAlbum.name : 'Select an album'}</h2>
                    {isLoadingThumbnails && imageCount === 0 && (
                        <span className="loading loading-spinner loading-sm"></span>
                    )}
                </div>
                <div>
                    <button className="btn btn-ghost">Select</button>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

                {imageUrls.map((imageUrl) => (
                    <div key={imageUrl} className="aspect-square hover:bg-base-300/90 select-none cursor-pointer rounded-lg p-1 bg-transparent overflow-hidden">
                        <img
                            src={imageUrl}
                            alt=""
                            className="w-full h-full object-cover rounded-md hover:transform hover:scale-105 transition-all duration-100"
                            loading="lazy"
                        />
                    </div>
                ))}

                {
                    imageCount > 0 &&
                    skeletonCount > 0 &&
                    Array(skeletonCount).fill(0).map((_, i) => (
                        <ImageSkeleton key={`skeleton-${i}`} />
                    ))
                }
            </div>
            {import.meta.env.DEV && <p className="text-xs text-base-content/50 mt-4">Running in development mode.</p>}
        </main>
    );
};

export default MainContent;
