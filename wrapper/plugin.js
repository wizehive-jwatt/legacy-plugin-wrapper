//import '../vendor/bootstrap.js'
//import '../vendor/bootstrap-datepicker.js'
//import '../vendor/bootstrap-datetimepicker.js'

import plugin from './lib/wrapper'
import { Filters } from './lib/filters'
import { Directives } from './lib/directives'
import { znForm, ZnForm } from './lib/zn-form'

Filters(plugin)
Directives(plugin)
ZnForm(plugin)

/* PLUGIN_JS */