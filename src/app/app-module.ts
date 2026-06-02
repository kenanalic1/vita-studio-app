import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import {
  LucideAngularModule,
  LayoutDashboard, Home, Calendar, ClipboardList,
  Users, User, Dumbbell, Zap, CreditCard, Building2,
  UserCheck, Clock, BarChart2, Bell,
  Pencil, Trash2, X, Check, Mail, Phone, Cake, MapPin,
  Settings, AlertTriangle, Lock, Sparkles, ChevronUp, ChevronDown,
  Star, Crown, LogIn, QrCode,
} from 'lucide-angular';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

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
import { Modal } from './shared/components/modal/modal';
import { NoviTerminModal } from './shared/components/novi-termin-modal/novi-termin-modal';
import { NovaClanicaModal } from './shared/components/nova-clanica-modal/nova-clanica-modal';
import { NovaSalaModal } from './shared/components/nova-sala-modal/nova-sala-modal';
import { NovaAktivnostModal } from './shared/components/nova-aktivnost-modal/nova-aktivnost-modal';
import { ProduziClanarinaModal } from './shared/components/produzi-clanarina-modal/produzi-clanarina-modal';
import { NoviTrenerModal } from './shared/components/novi-trener-modal/novi-trener-modal';
import { NotifikacijeComponent } from './shared/components/notifikacije/notifikacije';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const token = localStorage.getItem('vita_token');
  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(authReq);
  }
  return next(req);
}

@NgModule({
  declarations: [
    App,
    Login,
    Register,
    AdminLayout,
    AdminPregled,
    Kalendar,
    ClaniceLista,
    ClanProfil,
    TreneriLista,
    Aktivnosti,
    Clanarine,
    Sale,
    CheckinAdmin,
    Izvestaji,
    RezervacijeAdmin,
    ListaCekanjaAdmin,
    TrenerLayout,
    TrenerPregled,
    TrenerRaspored,
    CheckinTrener,
    Ucesnice,
    ClanLayout,
    ClanPocetna,
    RasporedBrowse,
    MojeRezervacije,
    MojProfil,
    MojaClanarina,
    Modal,
    NoviTerminModal,
    NovaClanicaModal,
    NovaSalaModal,
    NovaAktivnostModal,
    ProduziClanarinaModal,
    NoviTrenerModal,
    NotifikacijeComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule.pick({
      LayoutDashboard, Home, Calendar, ClipboardList,
      Users, User, Dumbbell, Zap, CreditCard, Building2,
      UserCheck, Clock, BarChart2, Bell,
      Pencil, Trash2, X, Check, Mail, Phone, Cake, MapPin,
      Settings, AlertTriangle, Lock, Sparkles, ChevronUp, ChevronDown,
      Star, Crown, LogIn, QrCode,
    }),
  ],
  providers: [provideHttpClient(withInterceptors([authInterceptor]))],
  bootstrap: [App],
})
export class AppModule {}
