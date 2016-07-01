import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { fetchFieldPropertiesIfNeeded } from '../../../actions/FieldPropertiesActions';
import { selectIndependentVariable, selectRegressionType } from '../../../actions/RegressionActions';
import styles from '../Analysis.sass';

import Sidebar from '../../Base/Sidebar';
import SidebarGroup from '../../Base/SidebarGroup';
import ToggleButtonGroup from '../../Base/ToggleButtonGroup';
import DropDownMenu from '../../Base/DropDownMenu';
import RaisedButton from '../../Base/RaisedButton';

const regressionTypes = [
  { value: 'linear', label: 'Linear' },
  { value: 'logistic', label: 'Logistic' },
  { value: 'polynomial', label: 'Polynomial '}
];

export class RegressionSidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      interactionVariables: [null, null]
    }
  }

  componentWillMount(props) {
    const { project, datasetSelector, fieldProperties, fetchFieldPropertiesIfNeeded } = this.props;

    if (project.properties.id && datasetSelector.datasetId && !fieldProperties.items.length && !fieldProperties.fetching) {
      fetchFieldPropertiesIfNeeded(project.properties.id, datasetSelector.datasetId)
    }
  }

  componentWillReceiveProps(nextProps) {
    const { project, datasetSelector, fieldProperties, fetchFieldPropertiesIfNeeded } = nextProps;
    const datasetIdChanged = datasetSelector.datasetId != this.props.datasetSelector.datasetId;

    if (project.properties.id && datasetSelector.datasetId && (datasetIdChanged || !fieldProperties.items.length) && !fieldProperties.fetching) {
      fetchFieldPropertiesIfNeeded(project.properties.id, datasetSelector.datasetId)
    }
  }

  onSelectDependentVariable(dependentVariable) {
    this.props.push(`/projects/${ this.props.project.properties.id }/datasets/${ this.props.datasetSelector.datasetId }/analyze/regression/${ dependentVariable }`);
  }

  onSelectRegressionType(regressionType) {
    this.props.selectRegressionType(regressionType);
  }

  onSelectInteractionTerm(dropDownNumber, independentVariableId) {
    const interactionVariables = this.state.interactionVariables;
    interactionVariables[dropDownNumber] = independentVariableId;

    this.setState({ interactionVariables: interactionVariables });
  }

  onSubmitInteractionTerm() {

  }

  render() {
    const { fieldProperties, regressionSelector, selectIndependentVariable } = this.props;

    return (
      <Sidebar selectedTab="regression">
        { fieldProperties.items.length != 0 &&
          <SidebarGroup heading="Regression Type">
            <DropDownMenu
              value={ regressionSelector.regressionType }
              options={ regressionTypes }
              onChange={ this.onSelectRegressionType.bind(this) } />
          </SidebarGroup>
        }
        { fieldProperties.items.length != 0 &&
          <SidebarGroup heading="Dependent Variable (Y)">
            <DropDownMenu
              value={ parseInt(regressionSelector.dependentVariableId) }
              options={ fieldProperties.items.filter((item) => item.generalType == 'q') }
              valueMember="id"
              displayTextMember="name"
              onChange={ this.onSelectDependentVariable.bind(this) }/>
          </SidebarGroup>
        }
        { fieldProperties.items.length != 0 &&
          <SidebarGroup heading="Explanatory Factors (X)">
            { fieldProperties.items.filter((property) => property.generalType == 'c').length > 0 &&
              <div className={ styles.fieldGroup }>
                <div className={ styles.fieldGroupLabel }>Categorical</div>
                <ToggleButtonGroup
                  toggleItems={ fieldProperties.items.filter((property) => property.generalType == 'c').map((item) =>
                    new Object({
                      id: item.id,
                      name: item.name,
                      disabled: (item.id == regressionSelector.dependentVariableId) || regressionSelector.dependentVariableId == null || ( item.generalType == 'c' && item.isUnique)
                    })
                  )}
                  displayTextMember="name"
                  valueMember="id"
                  externalSelectedItems={ regressionSelector.independentVariableIds }
                  separated={ true }
                  onChange={ selectIndependentVariable } />
              </div>
            }
            { fieldProperties.items.filter((property) => property.generalType == 't').length > 0 &&
              <div className={ styles.fieldGroup }>
                <div className={ styles.fieldGroupLabel }>Temporal</div>
                <ToggleButtonGroup
                  toggleItems={ fieldProperties.items.filter((property) => property.generalType == 't').map((item) =>
                    new Object({
                      id: item.id,
                      name: item.name,
                      disabled: (item.id == regressionSelector.dependentVariableId) || regressionSelector.dependentVariableId == null || ( item.generalType == 'c' && item.isUnique)
                    })
                  )}
                  valueMember="id"
                  displayTextMember="name"
                  externalSelectedItems={ regressionSelector.independentVariableIds }
                  separated={ true }
                  onChange={ selectIndependentVariable } />
              </div>
            }
            { fieldProperties.items.filter((property) => property.generalType == 'q').length > 0 &&
              <div className={ styles.fieldGroup }>
                <div className={ styles.fieldGroupLabel }>Quantitative</div>
                <ToggleButtonGroup
                  toggleItems={ fieldProperties.items.filter((property) => property.generalType == 'q').map((item) =>
                    new Object({
                      id: item.id,
                      name: item.name,
                      disabled: (item.id == regressionSelector.dependentVariableId) || regressionSelector.dependentVariableId == null || ( item.generalType == 'c' && item.isUnique)
                    })
                  )}
                  valueMember="id"
                  displayTextMember="name"
                  externalSelectedItems={ regressionSelector.independentVariableIds }
                  separated={ true }
                  onChange={ selectIndependentVariable } />
              </div>
            }
            { fieldProperties.items.filter((property) => property.generalType == 'q' || property.generalType == 'c').length > 0 &&
              <div className={ styles.fieldGroup }>
                <div className={ styles.fieldGroupLabel }>Interaction Terms</div>
                { regressionSelector.interactionTermIds.length > 0 ? 
                   <div></div> :
                  <div> None selected </div>
                }
              </div>
            }
          </SidebarGroup>
        }
          <SidebarGroup heading="Add Interaction Terms">
            <DropDownMenu
              value={ this.state.interactionVariables[0] }
              options={ fieldProperties.items.filter((item) => (item.generalType == 'q' || item.generalType == 'c') && item.id != this.state.interactionVariables[1]) }
              valueMember="id"
              displayTextMember="name"
              onChange={this.onSelectInteractionTerm.bind(this, 0)}
              />
            <DropDownMenu 
              value={ this.state.interactionVariables[1] }
              options={ fieldProperties.items.filter((item) => (item.generalType == 'q' || item.generalType == 'c') && item.id != this.state.interactionVariables[0]) }
              valueMember="id"
              displayTextMember="name"
              onChange={this.onSelectInteractionTerm.bind(this, 1)}/>
            <RaisedButton altText="Add" label="Add" onClick={this.onSubmitInteractionTerm.bind(this)}/>
          </SidebarGroup>
      </Sidebar>
    );
  }
}

RegressionSidebar.propTypes = {
  project: PropTypes.object.isRequired,
  datasetSelector: PropTypes.object.isRequired,
  fieldProperties: PropTypes.object.isRequired,
  regressionSelector: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  const { project, datasetSelector, fieldProperties, regressionSelector } = state;
  return {
    project,
    datasetSelector,
    fieldProperties,
    regressionSelector
  };
}

export default connect(mapStateToProps, { fetchFieldPropertiesIfNeeded, selectRegressionType, selectIndependentVariable, push })(RegressionSidebar);
