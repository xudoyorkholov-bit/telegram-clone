import { User, IUser } from '../models/User';

export interface ProfileUpdate {
  displayName?: string;
  username?: string;
  bio?: string;
}

export interface SearchResult {
  id: string;
  phoneNumber: string;
  username?: string;
  displayName: string;
  profilePicture?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export class UserService {
  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }

  /**
   * Search users by phone number, username, or display name
   */
  async searchUsers(query: string, currentUserId: string, limit: number = 20): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchQuery = query.trim();
    const phoneQuery = query.replace(/\D/g, '');

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { displayName: { $regex: searchQuery, $options: 'i' } },
        { username: { $regex: searchQuery, $options: 'i' } },
        { phoneNumber: { $regex: phoneQuery, $options: 'i' } },
      ],
    })
      .limit(limit)
      .sort({ displayName: 1 });

    return users.map((user) => ({
      id: user._id.toString(),
      phoneNumber: user.phoneNumber,
      username: user.username,
      displayName: user.displayName,
      profilePicture: user.profilePicture,
      bio: user.bio,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
    }));
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: ProfileUpdate): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (updates.username && updates.username !== user.username) {
      const existingUser = await User.findOne({ username: updates.username });
      if (existingUser) {
        throw new Error('Username already taken');
      }
    }

    if (updates.displayName) user.displayName = updates.displayName.trim();
    if (updates.username) user.username = updates.username.trim();
    if (updates.bio !== undefined) user.bio = updates.bio;

    await user.save();
    return user;
  }

  /**
   * Update profile picture
   */
  async updateProfilePicture(userId: string, photoUrl: string): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.profilePicture = photoUrl;
    await user.save();
    return user;
  }

  /**
   * Remove profile picture
   */
  async removeProfilePicture(userId: string): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.profilePicture = undefined;
    await user.save();
    return user;
  }
}
