'use client';

import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { Users, Bell, Search, Calendar as CalendarIcon, Info } from "lucide-react";
import { collection } from "firebase/firestore";
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatUserIdentifier } from "@/lib/utils";
import { UserProfile } from "@/lib/types";

export function UsersSection() {
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState<Date | undefined>();

    const usersCollectionRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersCollectionRef);

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        return users.filter(u => {
            const nameMatch = u.name.toLowerCase().includes(searchTerm.toLowerCase());
            const emailMatch = u.email.toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = statusFilter === 'all' || u.subscriptionStatus === statusFilter;
            const dateMatch = !dateFilter || (u.createdAt && isSameDay(new Date(u.createdAt.seconds * 1000), dateFilter));

            return (nameMatch || emailMatch) && statusMatch && dateMatch;
        });
    }, [users, searchTerm, statusFilter, dateFilter]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Liste complète des utilisateurs</CardTitle>
                <CardDescription>
                    Affichez, recherchez et filtrez tous les utilisateurs inscrits sur la plateforme.
                </CardDescription>
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par nom ou email..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filtrer par forfait" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les forfaits</SelectItem>
                            <SelectItem value="free">Gratuit</SelectItem>
                            <SelectItem value="welcome">Welcome</SelectItem>
                            <SelectItem value="eco">Éco</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                    </Select>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full sm:w-auto justify-start text-left font-normal",
                                    !dateFilter && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateFilter ? format(dateFilter, "PPP", { locale: fr }) : <span>Filtrer par date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={dateFilter}
                                onSelect={setDateFilter}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {dateFilter && (
                        <Button variant="ghost" onClick={() => setDateFilter(undefined)}>Réinitialiser</Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead className="hidden sm:table-cell">Date d'inscription</TableHead>
                            <TableHead>Forfait</TableHead>
                            <TableHead className="hidden lg:table-cell">Source</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                            <TableRow key={u.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={u.photoURL} alt={u.name} />
                                            <AvatarFallback>{u.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{u.name}</p>
                                            <p className="text-xs text-muted-foreground">{formatUserIdentifier(u.email)}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                    {u.createdAt ? format(new Date(u.createdAt.seconds * 1000), 'd MMM yyyy', { locale: fr }) : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={u.subscriptionStatus === 'free' ? 'secondary' : 'default'} className="capitalize">
                                        {u.subscriptionStatus}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-4 w-4" />
                                        <span>{u.referralSource || 'Non spécifié'}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => toast({ title: 'Bientôt disponible', description: "L'envoi de notifications sera bientôt implémenté." })}>
                                        <Bell className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    {isLoadingUsers ? "Chargement..." : "Aucun utilisateur trouvé."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
