import { Routes } from '@angular/router';
import { AddPlayer } from './add-player/add-player';
import { Home } from './home/home';

export const routes: Routes = [

    {
        path: "",
        component: Home
    },

    {
        path: 'add-player',
        component: AddPlayer
    }


];
