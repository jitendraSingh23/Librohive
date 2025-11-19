'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface FollowButtonProps {
  authorId: string;
  initialIsFollowing: boolean;
  followersCount: number;
}

export function FollowButton({ 
  authorId, 
  initialIsFollowing,
  followersCount: initialFollowersCount 
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
    setFollowersCount(initialFollowersCount);
  }, [initialIsFollowing, initialFollowersCount]);

  const handleFollow = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/users/${authorId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      
      setIsFollowing(data.isFollowing);
      setFollowersCount(data.followersCount); // Use the count from the server
      
      toast.success(data.message);
      router.refresh();
      
    } catch (error) {
      console.error('Error in follow/unfollow:', error);
      toast.error('Failed to follow/unfollow author');
      // Revert state on error
      setIsFollowing(initialIsFollowing);
      setFollowersCount(initialFollowersCount);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isFollowing ? "outline" : "default"}
        onClick={handleFollow}
        disabled={isLoading}
        className="min-w-[100px]"
      >
        {isLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
      </Button>
      
    </div>
  );
}