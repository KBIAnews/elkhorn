import preact from 'preact'
const {Component, h} = preact

import AskField from '../AskField'

class MultipleChoice extends AskField {

  constructor (props, context) {
    super(props, context)
    this.state = {
      rating: 0,
      focused: -1,
      value: [],
      otherSelected: false,
      otherValue: false
    }

    this.onOtherClick = this.onOtherClick.bind(this)
    this.onOtherChange = this.onOtherChange.bind(this)
    this.isSelected = this.isSelected.bind(this)
  }

  onOtherClick (e) {
    var otherValue = this.state.otherValue ? [ this.state.otherValue ] : []
    this.setState({ otherSelected: !this.state.otherSelected, value: this.props.multipleChoice ? this.state.value : otherValue })
    this.validate()
    this.update({ moveForward: false })
  }

  onOtherChange (e) {
    this.setState({ otherValue: e.target.value })
    this.validate()
    this.update({ moveForward: false })
  }

  onClick (i, e) {
    var newValue = this.state.value.slice()
    // if the clicked element is not present, add it
    if (newValue.indexOf(i) === -1) {
      if (this.props.pickUpTo) {
        if (newValue.length < this.props.pickUpTo) {
          newValue.push(i)
        } else {
          e.preventDefault()
        }
      } else {
        if (this.props.multipleChoice) {
          newValue.push(i)
        } else {
          // make it always an array
          newValue = [ i ]
        }
      }
    } else { // if not present, remove it
      newValue.splice(newValue.indexOf(i), 1)
    }
    // If it's not multiple choice, unset otherSelected when choosing an option from the list
    var newState = { focused: i, value: newValue, otherSelected: this.props.multipleChoice ? this.state.otherSelected : false }
    if (this.state.value.length >= 0) {
      newState = Object.assign({}, newState, { completed: true, isValid: true })
    } else {
      newState = Object.assign({}, newState, { completed: false })
    }
    this.setState(newState)
    this.validate()
    this.update({ moveForward: false })
  }

  // Style computing

  getOptionStyle (i) {
    return Object.assign({},
      styles.option,
      i === this.state.focused ? styles.focused : {},
      { backgroundColor: this.props.theme.inputBackground },
      this.state.value.indexOf(i) > -1 ? { // clicked
        backgroundColor: this.props.theme.selectedItemBackground,
        color: this.props.theme.selectedItemText
      } : {}
    )
  }

  isSelected (i) {
    return this.state.value.indexOf(i) > -1
  }

  getOtherStyle () {
    return Object.assign({},
      styles.option,
      { backgroundColor: this.props.theme.inputBackground },
      this.state.otherSelected ? { // clicked
        backgroundColor: this.props.theme.selectedItemBackground,
        color: this.props.theme.selectedItemText
      } : {}
    )
  }

  getStyles () {
    return Object.assign({}, styles.base, this.props.isValid ? styles.valid : styles.error)
  }

  // Template partials

  getOptions () {
    const { component, fieldNumber } = this.props
    const { isSelected } = this

    return this.props.options.map((option, i) => (
      <label
        className={`ask-form__option ${isSelected(i) ? 'selected' : ''}`}
        style={this.getOptionStyle(i)}
        key={i}
        for={`${component}--${fieldNumber}__field--${i}`}
        >
          <input
            tabIndex={i}
            id={`${component}--${fieldNumber}__field--${i}`}
            style={styles.optionCheck}
            onClick={this.onClick.bind(this, i)}
            name={'field-' + this.props.id}
            type={this.props.multipleChoice ? 'checkbox' : 'radio'}
            key={i}
          />

          {this.getCharIndex(i)}. {option.title}
          {this.state.value.indexOf(i) > -1
            ? <span style={styles.selectedMark} aria-hidden='true'>&times;</span>
            : null
          }
        </label>
    ))
  }

  // Interface Methods

  validate (validateRequired = false) {
    let isValid = true
    let isCompleted = false

    isCompleted = !!this.state.value.length || (this.state.otherSelected && !!this.state.otherValue.length)

    this.setState({ isValid: isValid, completed: isCompleted })

    return this.props.wrapper.required ? isValid && isCompleted : isValid
  }

  getValue () {
    var selectedOptions = []
    var optionTitle

    if (!!this.state.value && this.state.value.length) {
      this.state.value.map((index) => {
        optionTitle = this.props.options[index].title
        selectedOptions.push({
          index: index,
          title: optionTitle
        })
      })
    }

    if (this.state.otherSelected) {
      selectedOptions.push({
        title: this.state.otherValue,
        index: this.props.options.length
      })
    }

    return { options: selectedOptions }
  }

  getCharIndex (i) {
    return String.fromCharCode(65 + i)
  }

  render () {
    const { component, fieldNumber } = this.props
    return (
      <div>
        <fieldset
          className={'ask-form__multiple-choice__container'}
          id={`${component}--${fieldNumber}`}
          style={styles.base}>
          <legend style={styles.visuallyhidden}>{this.props.title}</legend>
          {
            this.props.options && !!this.props.options.length
            ? <div style={styles.optionsWrapper}>
                {this.getOptions()}
                {
                  this.props.otherAllowed
                  ?
                    <label
                      className={'ask-form__option--other'}
                      style={this.getOtherStyle()}
                      key={this.props.options.length}
                      for={`${component}--${fieldNumber}__field--other`}
                    ><input
                      id={`${component}--${fieldNumber}__field--other`}
                      style={styles.optionCheck}
                      onClick={this.onOtherClick}
                      tabIndex='0'
                      name={'field-' + this.props.id}
                      type={this.props.multipleChoice ? 'checkbox' : 'radio'}
                      key={this.props.options.length}
                      />
                        {this.getCharIndex(this.props.options.length)}. {this.props.otherText ? this.props.otherText : 'Other'}
                        {this.state.otherSelected
                          ? <span style={styles.selectedMark} aria-hidden='true'>&times;</span>
                          : null
                        }
                    </label>
                  : null
                }

              {
                this.props.otherAllowed && this.state.otherSelected
                ? <input type='text' placeholder='Please specify...' onChange={this.onOtherChange} style={styles.otherInput} />
                : null
              }

            </div>
            : null
          }
        </fieldset>
        {
          this.props.pickUpTo
          ? <div style={styles.bottomLegend}>{this.state.value.length} of {this.props.pickUpTo} selected.</div>
          : null
        }
      </div>
    )
  }
}

const styles = {
  base: {
    display: 'block',
    color: '#888',
    width: '100%',
    border: 'none',
    minHeight: '100px',
    padding: '0'
  },
  option: {
    display: 'inline-block',
    cursor: 'pointer',
    color: '#777',
    lineHeight: '1.2em',
    transition: 'background .2s',
    background: 'white',
    border: '1px solid #ccc',
    margin: '0 1% 10px 0',
    textAlign: 'left',
    borderRadius: '4px',
    minWidth: '100%',
    padding: '14px 20px',
    verticalAlign: 'top',
    fontSize: '1em'
  },
  clicked: {
    background: '#222',
    color: 'white'
  },
  focused: {
    border: '1px solid #47a'
  },
  optionTitle: {
    fontSize: '15pt',
    margin: '0',
    padding: '0',
    lineHeight: '1'
  },
  optionDescription: {
    margin: '0',
    padding: '0',
    lineHeight: '1'
  },
  optionCheck: {
    position: 'absolute',
    top: '18px',
    left: '-20000px'
  },
  bottomLegend: {
    color: '#999',
    fontSize: '10pt',
    padding: '0px',
    textAlign: 'right',
    width: '100%',
    marginTop: '5px'
  },
  otherLabel: {
    display: 'inline-block',
    marginRight: '20px'
  },
  otherInput: {
    height: '40px',
    lineHeight: '40px',
    padding: '0 10px',
    border: '1px solid #ccc',
    margin: '20px 0',
    display: 'block',
    width: '100%',
    fontSize: '10pt'
  },
  optionsWrapper: {
    marginRight: '-1%'
  },
  selectedMark: {
    fontWeight: 'bold',
    paddingLeft: '5px',
    fontSize: '14pt'
  },
  visuallyhidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    width: 1
  }
}

export default MultipleChoice
