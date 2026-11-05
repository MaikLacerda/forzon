import React, {useState} from 'react';
import type {UserProfile, CompletedWorkoutRecord, GPSActivity} from '../../types';
interface GlobalVolumeRankingProps { currentUserProfile: UserProfile; workoutHistory: CompletedWorkoutRecord[]; gpsActivities?: GPSActivity[]; compact?: boolean; onStartWorkoutClick?: () => void; }
export function GlobalVolumeRanking({workoutHistory,gpsActivities=[],onStartWorkoutClick}:GlobalVolumeRankingProps) {
 const [period,setPeriod]=useState<'week'|'month'|'all'>('week');
 const now=new Date(), start=new Date(now); start.setHours(0,0,0,0);
 if(period==='week')start.setDate(start.getDate()-(start.getDay()+6)%7);
 if(period==='month')start.setDate(1);
 const includes=(value:string)=>period==='all'||(new Date(value)>=start&&new Date(value)<=now);
 const workouts=workoutHistory.filter(r=>includes(r.completedAt)), activities=gpsActivities.filter(r=>includes(r.startedAt));
 const volume=workouts.reduce((n,r)=>n+(r.totalVolumeKg||0),0), distance=activities.reduce((n,r)=>n+(r.distanceKm||0),0);
 return <section className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-4 min-w-0"><h3 className="font-bold text-white">Sua atividade registrada</h3><div className="flex flex-wrap gap-2 text-xs">{([['week','Esta semana'],['month','Este mês'],['all','Todo o histórico']] as const).map(([key,label])=><button key={key} onClick={()=>setPeriod(key)} className={'rounded-lg px-3 py-2 border '+(period===key?'border-cyan-400 text-cyan-400':'border-neutral-700 text-neutral-400')}>{label}</button>)}</div><p className="text-xl font-bold">{volume.toLocaleString('pt-BR')} kg · {distance.toLocaleString('pt-BR',{maximumFractionDigits:1})} km</p><p className="text-sm text-neutral-400">{workouts.length} treinos concluídos neste período.</p><p className="text-xs text-neutral-500">O ranking entre atletas ainda não está conectado. Aqui aparecem somente seus próprios registros.</p><button className="text-cyan-400 py-2" onClick={onStartWorkoutClick}>Ir para meu treino</button></section>;
}
