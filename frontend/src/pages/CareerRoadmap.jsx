import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Map, CheckCircle2, Circle, Lock, ArrowRight, PlayCircle, Target, Briefcase, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CareerRoadmap() {
    const navigate = useNavigate();
    const { profile, preferences } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const [roadmap, setRoadmap] = useState(null);

    useEffect(() => {
        const fetchRoadmap = async () => {
            const email = profile?.email || localStorage.getItem('userEmail');
            if (!email) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch('http://localhost:8000/ai/generate-roadmap', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: email,
                        targetRole: preferences?.targetRole || 'Software Engineer',
                        skills: profile?.skills || [],
                        experienceLevel: preferences?.experienceLevel || 'Fresher'
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    setRoadmap(result.data);
                }
            } catch (err) {
                console.error("Failed to generate roadmap", err);
            } finally {
                setLoading(false);
            }
        };

        if (profile?.email || localStorage.getItem('userEmail')) {
            fetchRoadmap();
        }
    }, [profile, preferences]);

    const getStatusIcon = (status) => {
        switch(status) {
            case 'completed': return <CheckCircle2 className="w-8 h-8 text-green-500 fill-green-100 dark:fill-green-900/30" />;
            case 'in_progress': return <PlayCircle className="w-8 h-8 text-[#FF6B00] fill-[#FF6B00]/10" />;
            case 'locked': return <Lock className="w-8 h-8 text-gray-400 fill-gray-100 dark:fill-gray-800" />;
            default: return <Circle className="w-8 h-8 text-gray-400" />;
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="h-24 bg-gray-100 dark:bg-gray-900 animate-pulse rounded-xl"></div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-gray-100 dark:bg-gray-900 animate-pulse rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!roadmap) {
        return (
            <Card className="max-w-2xl mx-auto text-center py-20 border-dashed border-2">
                <Map className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Roadmap Unavailable</h2>
                <p className="text-gray-500 mb-6">Complete your profile and set a target role to generate a personalized career roadmap.</p>
                <Button onClick={() => navigate('/profile')} className="bg-[#111111] text-white hover:bg-gray-800">Complete Profile</Button>
            </Card>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            
            {/* Header */}
            <div className="bg-gradient-to-br from-[#111111] to-[#222222] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                    <Target className="w-48 h-48 -mt-8 -mr-8" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl font-extrabold font-poppins mb-2">{roadmap.title}</h1>
                    <p className="text-gray-300 font-inter text-lg">{roadmap.description}</p>
                    <div className="flex items-center gap-4 mt-6">
                        <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-[#FF6B00]" />
                            <span className="font-semibold">{preferences?.experienceLevel || 'Fresher'}</span>
                        </div>
                        <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 flex items-center gap-2">
                            <Target className="w-4 h-4 text-[#FF6B00]" />
                            <span className="font-semibold">{preferences?.targetRole || 'Not Set'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline Map */}
            <div className="relative pl-4 md:pl-0">
                {/* Vertical Line */}
                <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-green-500 via-[#FF6B00] to-gray-200 dark:to-gray-800 transform md:-translate-x-1/2 rounded-full"></div>

                <div className="space-y-12 relative z-10">
                    {roadmap.nodes.map((node, index) => {
                        const isEven = index % 2 === 0;
                        const isCompleted = node.status === 'completed';
                        const isInProgress = node.status === 'in_progress';
                        
                        return (
                            <div key={node.id} className={`flex flex-col md:flex-row items-start md:items-center w-full ${isEven ? 'md:flex-row-reverse' : ''}`}>
                                
                                {/* Mobile Icon & Line connection */}
                                <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center bg-background rounded-full p-2 border-4 border-background z-20 shadow-sm">
                                    {getStatusIcon(node.status)}
                                </div>
                                
                                {/* Content Card */}
                                <div className={`w-full md:w-[45%] pl-16 md:pl-0 ${isEven ? 'md:pr-16 md:text-right' : 'md:pl-16 text-left'}`}>
                                    <Card className={`transition-all duration-300 hover:shadow-xl ${isInProgress ? 'border-[#FF6B00] shadow-lg shadow-[#FF6B00]/5' : isCompleted ? 'border-green-500/50' : 'border-gray-200 dark:border-gray-800 opacity-75'}`}>
                                        <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${isInProgress ? 'text-[#FF6B00]' : isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                                            Step {index + 1}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{node.title}</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{node.description}</p>
                                        
                                        <div className={`flex flex-wrap gap-2 mb-4 ${isEven ? 'md:justify-end' : 'justify-start'}`}>
                                            {node.skills.map((skill, i) => (
                                                <Badge key={i} className={isCompleted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : isInProgress ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}>
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>

                                        <div className={`mt-4 p-3 rounded-lg text-sm font-semibold flex items-center justify-between ${isInProgress ? 'bg-[#FF6B00]/10 text-[#FF6B00]' : 'bg-gray-50 dark:bg-gray-900 text-gray-500'}`}>
                                            <span className="flex items-center gap-2"><ArrowRight className="w-4 h-4"/> Action Required</span>
                                            {isInProgress && <Button size="sm" variant="outline" className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white py-1 h-auto text-xs">Start</Button>}
                                        </div>
                                        <p className="text-xs mt-2 text-gray-500">{node.action}</p>
                                    </Card>
                                </div>
                                
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="text-center pt-8">
                <Button onClick={() => navigate('/my-courses')} className="bg-[#111111] text-white hover:bg-gray-800 flex items-center gap-2 mx-auto">
                    Explore Learning Hub <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
            
        </div>
    );
}
