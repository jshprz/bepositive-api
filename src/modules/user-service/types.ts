export type userProfileType = {
    id: string,
    userId: string,
    email: string,
    name: string,
    avatar: string,
    gender: string,
    profileTitle: string,
    profileDescription: string,
    dateOfBirth: string,
    website: string,
    city: string,
    state: string,
    zipcode: string,
    country: string,
    phoneNumber: string,
    isPublic: boolean,
    createdAt: Date | number,
    updatedAt: Date | number
}

export type userRelationshipTypes = {
    id: string,
    followeeId: string,
    followerId: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date
};