
export type DishData = {
  name: string;
  category: 'Plat Quotidien' | 'Plat Classique' | 'Healthy' | 'Prise de Masse' | 'Pâtes' | 'Poulet' | 'Poisson' | 'Cuisine du Monde' | 'Plat Unique' | 'Sur le Pouce' | 'Cuisine Africaine' | 'Cuisine Antillaise';
  origin: 'Française' | 'Italienne' | 'Asiatique' | 'Mexicaine' | 'Africaine' | 'Antillaise' | 'Mondiale';
  cookingTime: string; // e.g., '20 min', '1h 30min'
};

export const initialDishes: DishData[] = [
  // Plats Français Courants
  { name: 'Pâtes bolognaise', category: 'Plat Quotidien', origin: 'Italienne', cookingTime: '30 min' },
  { name: 'Pâtes carbonara (version française)', category: 'Plat Quotidien', origin: 'Italienne', cookingTime: '20 min' },
  { name: 'Riz cantonais maison', category: 'Plat Quotidien', origin: 'Asiatique', cookingTime: '25 min' },
  { name: 'Gratin de pâtes', category: 'Plat Unique', origin: 'Française', cookingTime: '40 min' },
  { name: 'Omelette nature / fromage / jambon', category: 'Plat Quotidien', origin: 'Française', cookingTime: '10 min' },
  { name: 'Quiche lorraine', category: 'Plat Unique', origin: 'Française', cookingTime: '45 min' },
  { name: 'Croque-monsieur', category: 'Sur le Pouce', origin: 'Française', cookingTime: '15 min' },
  { name: 'Steak haché + pâtes', category: 'Plat Quotidien', origin: 'Française', cookingTime: '15 min' },
  { name: 'Nuggets maison + frites', category: 'Plat Quotidien', origin: 'Mondiale', cookingTime: '30 min' },
  { name: 'Poulet rôti + légumes', category: 'Poulet', origin: 'Française', cookingTime: '1h 20min' },
  { name: 'Sauté de poulet à la crème', category: 'Poulet', origin: 'Française', cookingTime: '25 min' },
  { name: 'Ratatouille', category: 'Plat Quotidien', origin: 'Française', cookingTime: '1h' },
  { name: 'Riz au poulet', category: 'Poulet', origin: 'Française', cookingTime: '30 min' },
  { name: 'Poisson pané + purée', category: 'Poisson', origin: 'Française', cookingTime: '25 min' },
  { name: 'Poêlée de légumes + poulet', category: 'Plat Quotidien', origin: 'Française', cookingTime: '25 min' },
  { name: 'Tartiflette rapide', category: 'Plat Classique', origin: 'Française', cookingTime: '45 min' },
  { name: 'Saucisses + lentilles', category: 'Plat Quotidien', origin: 'Française', cookingTime: '40 min' },
  { name: 'Poêlée de pommes de terre', category: 'Plat Quotidien', origin: 'Française', cookingTime: '30 min' },
  { name: 'Pomme de terre sauté + œuf', category: 'Plat Quotidien', origin: 'Française', cookingTime: '20 min' },
  { name: 'Curry de poulet (version simplifiée)', category: 'Poulet', origin: 'Mondiale', cookingTime: '30 min' },
  { name: 'Poulet basquaise', category: 'Poulet', origin: 'Française', cookingTime: '50 min' },

  // Plats Classiques et de Fête
  { name: 'Bœuf bourguignon', category: 'Plat Classique', origin: 'Française', cookingTime: '3h' },
  { name: 'Blanquette de veau', category: 'Plat Classique', origin: 'Française', cookingTime: '2h' },
  { name: 'Pot-au-feu', category: 'Plat Classique', origin: 'Française', cookingTime: '3h 30min' },
  { name: 'Cassoulet', category: 'Plat Classique', origin: 'Française', cookingTime: '4h' },
  { name: 'Coq au vin', category: 'Plat Classique', origin: 'Française', cookingTime: '2h 30min' },
  { name: 'Quenelles sauce tomate / sauce blanche', category: 'Plat Classique', origin: 'Française', cookingTime: '30 min' },
  { name: 'Gratin dauphinois', category: 'Plat Unique', origin: 'Française', cookingTime: '1h 15min' },
  { name: 'Brandade de morue', category: 'Poisson', origin: 'Française', cookingTime: '45 min' },
  { name: 'Bouillabaisse', category: 'Poisson', origin: 'Française', cookingTime: '1h 30min' },
  { name: 'Choucroute garnie', category: 'Plat Classique', origin: 'Française', cookingTime: '2h' },
  { name: 'Couscous maison', category: 'Cuisine du Monde', origin: 'Africaine', cookingTime: '2h' },
  { name: 'Paella (version familiale)', category: 'Cuisine du Monde', origin: 'Mondiale', cookingTime: '1h 15min' },
  { name: 'Hachis parmentier', category: 'Plat Unique', origin: 'Française', cookingTime: '1h' },
  { name: 'Poulet à la moutarde', category: 'Poulet', origin: 'Française', cookingTime: '45 min' },
  { name: 'Lapin à la moutarde', category: 'Plat Classique', origin: 'Française', cookingTime: '1h 30min' },
  { name: 'Filet mignon à la crème', category: 'Plat Classique', origin: 'Française', cookingTime: '40 min' },
  { name: 'Gratin de courgettes', category: 'Plat Unique', origin: 'Française', cookingTime: '45 min' },
  { name: 'Chili con carne', category: 'Cuisine du Monde', origin: 'Mexicaine', cookingTime: '1h' },
  { name: 'Lasagnes maison', category: 'Plat Unique', origin: 'Italienne', cookingTime: '1h 15min' },

  // Plats "Healthy"
  { name: 'Salade niçoise', category: 'Healthy', origin: 'Française', cookingTime: '20 min' },
  { name: 'Salade composée (poulet, pâtes, thon…)', category: 'Healthy', origin: 'Mondiale', cookingTime: '15 min' },
  { name: 'Poisson vapeur + légumes', category: 'Healthy', origin: 'Mondiale', cookingTime: '20 min' },
  { name: 'Poulet grillé + légumes sautés', category: 'Healthy', origin: 'Mondiale', cookingTime: '25 min' },
  { name: 'Wraps poulet crudités', category: 'Healthy', origin: 'Mondiale', cookingTime: '15 min' },
  { name: 'Bowl avec quinoa / riz', category: 'Healthy', origin: 'Mondiale', cookingTime: '25 min' },
  { name: 'Brocolis vapeur + œuf dur', category: 'Healthy', origin: 'Mondiale', cookingTime: '15 min' },
  { name: 'Poêlée de légumes + tofu', category: 'Healthy', origin: 'Mondiale', cookingTime: '20 min' },
  { name: 'Soupe de légumes maison', category: 'Healthy', origin: 'Française', cookingTime: '40 min' },
  { name: 'Velouté de courgettes', category: 'Healthy', origin: 'Française', cookingTime: '30 min' },
  { name: 'Salade avocat + saumon', category: 'Healthy', origin: 'Mondiale', cookingTime: '10 min' },
  { name: 'Légumes rôtis au four', category: 'Healthy', origin: 'Mondiale', cookingTime: '35 min' },
  { name: 'Dinde grillée + haricots verts', category: 'Healthy', origin: 'Mondiale', cookingTime: '20 min' },
  { name: 'Filet de poisson + riz complet', category: 'Healthy', origin: 'Mondiale', cookingTime: '25 min' },
  { name: 'Omelette aux légumes', category: 'Healthy', origin: 'Française', cookingTime: '15 min' },
  { name: 'Poêlée minceur (courgette, tomate, oignon, poulet)', category: 'Healthy', origin: 'Mondiale', cookingTime: '20 min' },
  { name: 'Soupe brûle-graisse', category: 'Healthy', origin: 'Mondiale', cookingTime: '30 min' },
  { name: 'Courgettes farcies light', category: 'Healthy', origin: 'Française', cookingTime: '45 min' },
  { name: 'Salade de lentilles + œuf', category: 'Healthy', origin: 'Française', cookingTime: '20 min' },
  { name: 'Salade chou + carotte + poulet', category: 'Healthy', origin: 'Mondiale', cookingTime: '15 min' },
  { name: 'Poisson en papillote', category: 'Healthy', origin: 'Française', cookingTime: '25 min' },
  { name: 'Poulet grillé + riz basmati', category: 'Healthy', origin: 'Mondiale', cookingTime: '25 min' },

  // Plats "Prise de Masse"
  { name: 'Pâtes complètes + saumon', category: 'Prise de Masse', origin: 'Mondiale', cookingTime: '20 min' },
  { name: 'Steak + légumes', category: 'Prise de Masse', origin: 'Française', cookingTime: '15 min' },
  { name: 'Bowl riz + œuf + poulet', category: 'Prise de Masse', origin: 'Mondiale', cookingTime: '30 min' },
  { name: 'Pancakes protéinés', category: 'Prise de Masse', origin: 'Mondiale', cookingTime: '15 min' },
  { name: 'Sauté de dinde + légumes', category: 'Prise de Masse', origin: 'Mondiale', cookingTime: '20 min' },
  { name: 'Risotto au poulet', category: 'Prise de Masse', origin: 'Italienne', cookingTime: '35 min' },
  { name: 'Chili con carne protéiné', category: 'Prise de Masse', origin: 'Mexicaine', cookingTime: '1h' },
  { name: 'Wraps poulet crudités (protéiné)', category: 'Prise de Masse', origin: 'Mondiale', cookingTime: '15 min' },
  { name: 'Protéines + patate douce', category: 'Prise de Masse', origin: 'Mondiale', cookingTime: '30 min' },
  { name: 'Wok poulet / crevettes', category: 'Prise de Masse', origin: 'Asiatique', cookingTime: '20 min' },
  { name: 'Lentilles + poulet', category: 'Prise de Masse', origin: 'Mondiale', cookingTime: '40 min' },
  { name: 'Riz + thon + œuf dur', category: 'Prise de Masse', origin: 'Mondiale', cookingTime: '15 min' },

  // Plats à base de Pâtes
  { name: 'Pâtes au pesto', category: 'Pâtes', origin: 'Italienne', cookingTime: '15 min' },
  { name: 'Pâtes carbonara', category: 'Pâtes', origin: 'Italienne', cookingTime: '20 min' },
  { name: 'Pâtes bolo', category: 'Pâtes', origin: 'Italienne', cookingTime: '30 min' },
  { name: 'Pâtes au thon', category: 'Pâtes', origin: 'Mondiale', cookingTime: '15 min' },
  { name: 'Pâtes champignons crème', category: 'Pâtes', origin: 'Française', cookingTime: '20 min' },
  { name: 'Pâtes saumon crème', category: 'Pâtes', origin: 'Française', cookingTime: '20 min' },
  { name: 'Pâtes poulet curry', category: 'Pâtes', origin: 'Mondiale', cookingTime: '25 min' },
  { name: 'Pâtes gratinées au four', category: 'Pâtes', origin: 'Française', cookingTime: '35 min' },
  { name: 'Pâtes ail–huile–persil', category: 'Pâtes', origin: 'Italienne', cookingTime: '15 min' },
  
  // Plats à base de Poulet
  { name: 'Poulet rôti', category: 'Poulet', origin: 'Française', cookingTime: '1h 20min' },
  { name: 'Poulet coco', category: 'Poulet', origin: 'Mondiale', cookingTime: '40 min' },
  { name: 'Poulet teriyaki', category: 'Poulet', origin: 'Asiatique', cookingTime: '25 min' },
  { name: 'Poulet mariné au citron', category: 'Poulet', origin: 'Mondiale', cookingTime: '30 min' },
  { name: 'Ailes de poulet rôties', category: 'Poulet', origin: 'Mondiale', cookingTime: '45 min' },

  // Plats à base de Poisson
  { name: 'Saumon au four', category: 'Poisson', origin: 'Mondiale', cookingTime: '20 min' },
  { name: 'Poisson pané maison', category: 'Poisson', origin: 'Française', cookingTime: '25 min' },
  { name: 'Cabillaud en papillote', category: 'Poisson', origin: 'Française', cookingTime: '20 min' },
  { name: 'Saumon à la crème', category: 'Poisson', origin: 'Française', cookingTime: '20 min' },
  { name: 'Poisson vapeur + citron', category: 'Poisson', origin: 'Mondiale', cookingTime: '15 min' },
  { name: 'Gratin de poisson', category: 'Poisson', origin: 'Française', cookingTime: '40 min' },
  { name: 'Brandade', category: 'Poisson', origin: 'Française', cookingTime: '45 min' },
  { name: 'Crevettes sautées', category: 'Poisson', origin: 'Asiatique', cookingTime: '15 min' },

  // Cuisine du Monde (Populaire en France)
  { name: 'Tacos maison', category: 'Cuisine du Monde', origin: 'Mexicaine', cookingTime: '30 min' },
  { name: 'Kebab maison', category: 'Cuisine du Monde', origin: 'Mondiale', cookingTime: '40 min' },
  { name: 'Fajitas', category: 'Cuisine du Monde', origin: 'Mexicaine', cookingTime: '30 min' },
  { name: 'Curry indien', category: 'Cuisine du Monde', origin: 'Mondiale', cookingTime: '45 min' },
  { name: 'Riz sauté asiatique', category: 'Cuisine du Monde', origin: 'Asiatique', cookingTime: '20 min' },
  { name: 'Wok nouilles chinoises', category: 'Cuisine du Monde', origin: 'Asiatique', cookingTime: '25 min' },
  { name: 'Sushi maison', category: 'Cuisine du Monde', origin: 'Asiatique', cookingTime: '1h' },
  { name: 'Burger maison', category: 'Cuisine du Monde', origin: 'Mondiale', cookingTime: '30 min' },
  { name: 'Shawarma maison', category: 'Cuisine du Monde', origin: 'Mondiale', cookingTime: '45 min' },
  
  // Plats Uniques
  { name: 'Pizza maison', category: 'Plat Unique', origin: 'Italienne', cookingTime: '30 min' },
  { name: 'Tarte salée (quiche, poireaux, tomates)', category: 'Plat Unique', origin: 'Française', cookingTime: '50 min' },
  { name: 'Parmentier', category: 'Plat Unique', origin: 'Française', cookingTime: '1h' },

  // Sur le Pouce
  { name: 'Sandwich jambon-beurre', category: 'Sur le Pouce', origin: 'Française', cookingTime: '5 min' },
  { name: 'Sandwich poulet crudités', category: 'Sur le Pouce', origin: 'Française', cookingTime: '10 min' },
  { name: 'Salade / avocat / thon', category: 'Sur le Pouce', origin: 'Mondiale', cookingTime: '10 min' },
  { name: 'Tortilla omelette', category: 'Sur le Pouce', origin: 'Mondiale', cookingTime: '15 min' },
  { name: 'Soupe instant maison', category: 'Sur le Pouce', origin: 'Mondiale', cookingTime: '10 min' },
  { name: 'Purée + œuf', category: 'Sur le Pouce', origin: 'Française', cookingTime: '15 min' },
  
  // Cuisine d'Afrique Subsaharienne
  { name: 'Attiéké + poisson', category: 'Cuisine Africaine', origin: 'Africaine', cookingTime: '40 min' },
  { name: 'Poulet yassa', category: 'Cuisine Africaine', origin: 'Africaine', cookingTime: '1h 30min' },
  { name: 'Tiep bou dien', category: 'Cuisine Africaine', origin: 'Africaine', cookingTime: '2h' },
  { name: 'Mafé (arachide)', category: 'Cuisine Africaine', origin: 'Africaine', cookingTime: '1h 45min' },
  { name: 'Jollof rice', category: 'Cuisine Africaine', origin: 'Africaine', cookingTime: '1h' },
  { name: 'Poulet DG (Cameroun)', category: 'Cuisine Africaine', origin: 'Africaine', cookingTime: '1h 15min' },
  { name: 'Riz sauce graine', category: 'Cuisine Africaine', origin: 'Africaine', cookingTime: '1h 30min' },
  { name: 'Tô + sauces (Afrique de l’Ouest)', category: 'Cuisine Africaine', origin: 'Africaine', cookingTime: '45 min' },
  { name: 'Alloco', category: 'Cuisine Africaine', origin: 'Africaine', cookingTime: '20 min' },
  { name: 'Foufou + sauce arachide / feuille', category: 'Cuisine Africaine', origin: 'Africaine', cookingTime: '1h' },
  { name: 'Brochettes (suya)', category: 'Cuisine Africaine', origin: 'Africaine', cookingTime: '30 min' },
  { name: 'Haricot rouges + riz (Congo)', category: 'Cuisine Africaine', origin: 'Africaine', cookingTime: '1h 15min' },
  { name: 'Sauce feuille + riz', category: 'Cuisine Africaine', origin: 'Africaine', cookingTime: '1h' },

  // Cuisine Antillaise
  { name: 'Colombo', category: 'Cuisine Antillaise', origin: 'Antillaise', cookingTime: '1h 15min' },
  { name: 'Poulet boucané', category: 'Cuisine Antillaise', origin: 'Antillaise', cookingTime: '1h 30min' },
  { name: 'Riz créole', category: 'Cuisine Antillaise', origin: 'Antillaise', cookingTime: '25 min' },
  { name: 'Accras de morue', category: 'Cuisine Antillaise', origin: 'Antillaise', cookingTime: '30 min' },
  { name: 'Boudin créole', category: 'Cuisine Antillaise', origin: 'Antillaise', cookingTime: '25 min' },
  { name: 'Dombrés', category: 'Cuisine Antillaise', origin: 'Antillaise', cookingTime: '45 min' },
  { name: 'Blaff de poisson', category: 'Cuisine Antillaise', origin: 'Antillaise', cookingTime: '30 min' },
  { name: 'Colombo de cabri', category: 'Cuisine Antillaise', origin: 'Antillaise', cookingTime: '2h' },
];
