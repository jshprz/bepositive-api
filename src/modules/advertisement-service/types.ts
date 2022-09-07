export type advertisementType = {
    content: {
        classification: string,
        advertisementId: string,
        caption: string,
        googleMapsPlaceId: string,
        locationDetails: string,
        link: string,
        attachments: ({
            key: string,
            url: string,
            type: string,
            height: string,
            width: string
        }[] & {
            key: string,
            type: string
        }[]) | null,
        isSponsored: boolean | null,
        createdAt: Date | number,
        updatedAt: Date | number,
    },
    actor: {
        userId: string | null,
        name: string,
        avatar: {
            url: string,
            type: string,
            height: string,
            width: string
        }
    }
};

export type advertisementFeedTypes = {
    content: {
        classification: string,
        advertisementId: string,
        caption: string,
        googleMapsPlaceId: string,
        locationDetails: string,
        link: string,
        attachments: ({
            key: string,
            url: string,
            type: string,
            height: string,
            width: string
        }[] & {
            key: string,
            type: string
        }[]) | null,
        originalPost: null,
        isLiked: boolean | null,
        isSponsored: boolean | null,
        createdAt: Date | number,
        updatedAt: Date | number,
    },
    actor: {
        userId: string | null,
        name: string,
        avatar: {
            url: string,
            type: string,
            height: string,
            width: string
        }
    }
} | null;