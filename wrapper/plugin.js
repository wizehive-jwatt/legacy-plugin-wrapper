//import '../vendor/bootstrap.js'
//import '../vendor/bootstrap-datepicker.js'
//import '../vendor/bootstrap-datetimepicker.js'

import plugin from './wrapper'
import { Filters } from './anglerfish/filters'
import { Directives } from './anglerfish/directives'
import { znForm, ZnForm } from './anglerfish/zn-form'

Filters(plugin)
Directives(plugin)
ZnForm(plugin)

/* PLUGIN_JS */