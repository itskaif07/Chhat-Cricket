import { Routes } from '@angular/router';
import { AddPlayer } from './add-player/add-player';
import { Home } from './home/home';
import { PlayersList } from './players-list/players-list';
import { PlayerInfo } from './player-info/player-info';
import { Welcome } from './features/unlimited/welcome/welcome';
import { SelectPlayers } from './features/unlimited/select-players/select-players';
import { About } from './about/about';
import { TossPage } from './features/unlimited/toss-page/toss-page';
import { LiveMatch } from './features/unlimited/live-match/live-match';
import { LeftoverPlayer } from './features/unlimited/leftover-player/leftover-player';
import { MainPage } from './match-history/main-page/main-page';
import { Scorecard } from './match-history/scorecard/scorecard';

export const routes: Routes = [

    {
        path: "",
        component: Home
    },

    {
        path: 'add-player',
        component: AddPlayer
    },

    {
        path: 'about',
        component: About
    },

    {
        path: 'players-list',
        component: PlayersList

    },

    {
        path: 'player-info/:id',
        component: PlayerInfo
    },

    // Matches History

    {
        path: 'matches-history',
        component: MainPage
    },

    {
        path:'match-scorecard/:id',
        component:Scorecard
    },

    // Unlimited Match

    {
        path: 'unlimited/welcome',
        component: Welcome
    },

    {
        path: 'unlimited/select-players',
        component: SelectPlayers
    },

    {
        path: 'unlimited/toss',
        component:TossPage
    },

    {
        path: 'unlimited/leftover-player',
        component: LeftoverPlayer
    },

    {
        path: 'unlimited/live-match',
        component:LiveMatch
    }


];
