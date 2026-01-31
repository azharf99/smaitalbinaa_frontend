import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SkeletonCard } from '../common/Skeleton.jsx';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/posts/?limit=3`;

const PostCard = ({ post }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
        <Link to={`/news/${post.slug}`}>
            <img className="w-full h-48 object-cover object-center" src={post.featured_image || 'https://placehold.co/400x300?text=No+Image'} alt={post.title} />
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 truncate">{post.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.created_at).toLocaleDateString()}
                </p>
            </div>
        </Link>
    </div>
);

export default function RecentPosts() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecentPosts = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error('Failed to fetch posts');
                const data = await response.json();
                setPosts(data.results || []);
            } catch (error) {
                console.error("Error fetching recent posts:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecentPosts();
    }, []);

    return (
        <div className="mt-12">
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">Latest News & Updates</h2>
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.length > 0 ? (
                        posts.map(post => <PostCard key={post.id} post={post} />)
                    ) : (
                        <p className="col-span-full text-center text-gray-500">No recent posts available.</p>
                    )}
                </div>
            )}
        </div>
    );
}