import React, { Component } from 'react'
import './Styles.css'

//Users
import ListUsers from '../Users/ListUsers'
import CreateUser from '../Users/CreateUser'
import ModifyUser from '../Users/ModifyUser'

//Products
import ListProducts from '../Products/ListProducts'
import CreateProduct from '../Products/CreateProduct'
import ModifyProductById from '../Products/ModifyProductById'

//Locations
import ListLocations from '../Locations/ListLocations'
import CreateLocation from '../Locations/CreateLocation'
import ModifyLocation from '../Locations/ModifyLocation'

//Procedures
import ListProcedures from '../Procedures/ListProcedures'
import CreateProcedures from '../Procedures/CreateProcedures'

//Orders
import ListOrders from '../Orders/ListOrders'
import ModifyOrderById from '../Orders/ModifyOrderById'
import RecordsOrders from '../Orders/RecordsOrders'

//Sync
import SyncProducts from '../Sync/SyncProducts'
import SyncProcedures from '../Sync/SyncProcedures'
import Records from '../Sync/Records'
import State from '../Sync/State'

//Parameters
import Parameters from '../Parameters/Parameters'

//Dispatchs
import CreateDispatch from '../Dispatchs/CreateDispatch'
import ListDispatch from '../Dispatchs/ListDispatch'
import ModifyDispatch from '../Dispatchs/ModifyDispatch'

import { setOptionsByRol } from '../../Functions/MenuOptions'
import { parseOptionToStatic } from '../../Functions/Helpers'

class MenuView extends Component {
  constructor() {
    super()
    this.state = {
      selected: 0,
      modal: '',
    }
  }

  componentDidMount() {
    this.collapseAll()
    let rol = sessionStorage.getItem('user_rol')
    let id = 'group-'
    let num = 1

    switch (rol) {
      case 'administrador':
        id = id + 1
        break

      case 'usuario':
        id = id + 4
        num = 10
        break
    }

    this.setState({ selected: num })

    let component = document.getElementById(id)
    component.style.display = 'block'
    document.getElementById(num).className = 'm-menu-label selected'

    id = parseOptionToStatic(num)
    document.getElementById(id).className =
      'm-menu-static-label static-selected'

    return
  }

  // Functions to handle states
  changeSelected = (event) => {
    let newID = parseInt(event.target.id)
    this.changeSelectedStyle(newID)

    return this.setState({ selected: newID })
  }

  changeSelectedFromComponent = (selected) => {
    this.changeSelectedStyle(selected)
    return this.setState({ selected: selected })
  }

  logout = () => {
    this.props.changeView('login')
    return sessionStorage.clear()
  }

  // Functions to handle modal
  showModal = (modal) => {
    this.setState({ modal: modal })
  }

  closeModal = () => {
    this.setState({ modal: '' })
  }

  // Auxiliary functions
  showUserMenu() {
    let visibility = document.getElementById('logout').style.visibility

    if (visibility == 'visible') {
      document.getElementById('logout').style.visibility = 'hidden'
      return
    }

    document.getElementById('logout').style.visibility = 'visible'
    return
  }

  getSubComponent() {
    switch (this.state.selected) {
      case 1:
        return <ListUsers changeSelected={this.changeSelectedFromComponent} />
      case 2:
        return <CreateUser />
      case 3:
        return <ListProducts changeSelected={this.changeSelectedFromComponent} />
      case 4:
        return <ListProcedures changeSelected={this.changeSelectedFromComponent} />
      case 5:
        return <ListLocations
          changeSelected={this.changeSelectedFromComponent}
          showModal={this.showModal}
          closeModal={this.closeModal} />
      case 6:
        return <ModifyProductById />
      case 7:
        return <CreateProduct />
      case 9:
        return <CreateProcedures />
      case 10:
        return <ListOrders
          changeSelected={this.changeSelectedFromComponent}
          showModal={this.showModal}
          closeModal={this.closeModal}
        />
      case 11:
        return <SyncProducts
          changeSelected={this.changeSelectedFromComponent}
          showModal={this.showModal}
          closeModal={this.closeModal}
        />
      case 12:
        return <ModifyUser />
      case 13:
        return <SyncProcedures
          changeSelected={this.changeSelectedFromComponent}
          showModal={this.showModal}
          closeModal={this.closeModal}
        />
      case 14:
        return <Records changeSelected={this.changeSelectedFromComponent} />
      case 15:
        return <ModifyOrderById />
      case 16:
        return <RecordsOrders
          changeSelected={this.changeSelectedFromComponent}
          showModal={this.showModal}
          closeModal={this.closeModal}
        />
      case 17:
        return <Parameters />
      case 18:
        return <State />
      case 19:
        return <ListDispatch changeSelected={this.changeSelectedFromComponent} />
      case 20:
        return <CreateDispatch />
      case 22:
        return <CreateLocation />
      case 23:
        return <ModifyLocation />
      case 24:
        return <ModifyDispatch />

    }
  }

  changeSelectedStyle(newID) {
    document.getElementById(this.state.selected).className = 'm-menu-label'
    document.getElementById(newID).className = 'm-menu-label selected'

    let id = parseOptionToStatic(this.state.selected)
    document.getElementById(id).className = 'm-menu-static-label'

    id = parseOptionToStatic(newID)
    document.getElementById(id).className =
      'm-menu-static-label static-selected'

    return
  }

  collapse = (event) => {
    let id = event.target.id.split('-')[1]
    let component = document.getElementById('group-' + id)

    if (component.style.display === 'block') {
      component.style.display = 'none'
    } else {
      component.style.display = 'block'
      this.collapseAll(id)
    }

    return
  }

  collapseAll = (currentMenuId) => {
    for (let i = 1; i <= 30; i++) {
      let id = 'group-' + i
      let component = document.getElementById(id)

      if (component != null && i !== Number(currentMenuId)) {
        component.style.display = 'none'
      }
    }

    return
  }

  getRolOptions() {
    let rol = sessionStorage.getItem('user_rol')

    if (!rol) {
      rol = 'usuario'
    }

    return setOptionsByRol(rol, this.collapse, this.changeSelected)
  }

  render() {
    let menuOptions = this.getRolOptions()
    let component = this.getSubComponent()
    let name = sessionStorage.getItem('user_name')

    if (!name) {
      name = 'Nombre Apellido'
    }

    return (
      <div className='m-container'>
        {this.state.modal}
        <div
          id='logout'
          className='m-close-session'
          style={{ visibility: 'hidden' }}
          onClick={this.logout}
        >
          <img className='m-icon' src='./logout-gray.png' alt='logout' />
          <span className='m-label'>Cerrar sessión</span>
        </div>
        {/* HEADER */}
        <div className='m-header'>
          <div className='m-logo-container'>
            <img className='m-logo' src='./favico.png' alt='logo' />
            <span className='m-label-header'>LASKIN - INTEGRADOR 2.0</span>
          </div>
          <div className='m-loged-user-container' onClick={this.showUserMenu}>
            <div className='m-ellipse'>{name[0]}</div>
            <span className='m-user-name'>{name}</span>
            <img className='m-icon' src='./arrow-gray.png' alt='arrow' />
          </div>
        </div>
        {/* MENU */}
        <div className='m-body-container'>
          <div className='m-menu-container'>{menuOptions}</div>
          {/* SUB COMPONENT */}
          <div className='m-component-container'>{component}</div>
        </div>
      </div>
    )
  }
}

export default MenuView