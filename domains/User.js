class User {
  constructor(props) {
    const { user, user_bilog, password } = props;
    
    this.access = {
      user: user,
      user_bilog: user_bilog,
      password: password,
    }
    this.id,
    this.isSupervisor,
    this.isEnabled,
    this.isDentist,
    this.professionalId,
    this.dentistSchedule,
    this.dentistData,
    this.officeId
  }

  updateUserData(userNewData) {
    const {
      id_usuario,
      es_supervisor,
      habilitado,
      es_odontologo,
      id_prof,
      es_odontologo_agenda,
      es_odontologo_datos,
      id_sucursal
    } = userNewData
    
    this.id = id_usuario,
    this.isSupervisor = es_supervisor,
    this.isEnabled = habilitado,
    this.isDentist = es_odontologo,
    this.professionalId = id_prof,
    this.dentistSchedule = es_odontologo_agenda,
    this.dentistData = es_odontologo_datos,
    this.officeId = id_sucursal
  }
}

module.exports = User;
