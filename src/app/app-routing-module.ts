import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';

import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Layout as AdminLayout } from './features/admin/layout/layout';
import { Pregled as AdminPregled } from './features/admin/pregled/pregled';
import { Kalendar } from './features/admin/kalendar/kalendar';
import { ClaniceLista } from './features/admin/clanice/clanice-lista/clanice-lista';
import { ClanProfil } from './features/admin/clanice/clan-profil/clan-profil';
import { TreneriLista } from './features/admin/treneri/treneri-lista/treneri-lista';
import { Aktivnosti } from './features/admin/aktivnosti/aktivnosti';
import { Clanarine } from './features/admin/clanarine/clanarine';
import { Sale } from './features/admin/sale/sale';
import { CheckinAdmin } from './features/admin/checkin/checkin-admin/checkin-admin';
import { Izvestaji } from './features/admin/izvestaji/izvestaji';
import { RezervacijeAdmin } from './features/admin/rezervacije/rezervacije-admin/rezervacije-admin';
import { ListaCekanja as ListaCekanjaAdmin } from './features/admin/lista-cekanja/lista-cekanja';
import { Layout as TrenerLayout } from './features/trener/layout/layout';
import { Pregled as TrenerPregled } from './features/trener/pregled/pregled';
import { Raspored as TrenerRaspored } from './features/trener/raspored/raspored';
import { CheckinTrener } from './features/trener/checkin/checkin-trener/checkin-trener';
import { Ucesnice } from './features/trener/ucesnice/ucesnice';
import { Layout as ClanLayout } from './features/clan/layout/layout';
import { Pocetna as ClanPocetna } from './features/clan/pocetna/pocetna';
import { RasporedBrowse } from './features/clan/raspored/raspored-browse/raspored-browse';
import { MojeRezervacije } from './features/clan/rezervacije/moje-rezervacije/moje-rezervacije';
import { MojProfil } from './features/clan/profil/moj-profil/moj-profil';
import { MojaClanarina } from './features/clan/clanarina/moja-clanarina/moja-clanarina';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [AuthGuard],
    data: { roles: ['administrator'] },
    children: [
      { path: '', redirectTo: 'pregled', pathMatch: 'full' },
      { path: 'pregled', component: AdminPregled },
      { path: 'kalendar', component: Kalendar },
      { path: 'rezervacije', component: RezervacijeAdmin },
      { path: 'clanice', component: ClaniceLista },
      { path: 'clanice/:id', component: ClanProfil },
      { path: 'treneri', component: TreneriLista },
      { path: 'aktivnosti', component: Aktivnosti },
      { path: 'clanarine', component: Clanarine },
      { path: 'sale', component: Sale },
      { path: 'checkin', component: CheckinAdmin },
      { path: 'lista-cekanja', component: ListaCekanjaAdmin },
      { path: 'izvestaji', component: Izvestaji },
    ],
  },

  {
    path: 'trener',
    component: TrenerLayout,
    canActivate: [AuthGuard],
    data: { roles: ['trener'] },
    children: [
      { path: '', redirectTo: 'pregled', pathMatch: 'full' },
      { path: 'pregled', component: TrenerPregled },
      { path: 'raspored', component: TrenerRaspored },
      { path: 'checkin', component: CheckinTrener },
      { path: 'ucesnice', component: Ucesnice },
    ],
  },

  {
    path: 'clan',
    component: ClanLayout,
    canActivate: [AuthGuard],
    data: { roles: ['clan'] },
    children: [
      { path: '', redirectTo: 'pocetna', pathMatch: 'full' },
      { path: 'pocetna', component: ClanPocetna },
      { path: 'raspored', component: RasporedBrowse },
      { path: 'rezervacije', component: MojeRezervacije },
      { path: 'profil', component: MojProfil },
      { path: 'clanarina', component: MojaClanarina },
    ],
  },

  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
