import preact from 'preact'
const { h, Component } = preact
import AskWidgetWrapper from './AskWidgetWrapper'
import AskComposerFooter from './AskComposerFooter'

class AskComposer extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      currentStep: 0,
      completedSteps: [],
      page: this.props.steps[0],
      ...this.props
    }
    this.composerAnimationFrame = (function(){
      return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function( callback ){ window.setTimeout(callback, 1000 / 60); };
    })();
  }

  componentDidMount() {
    this._composer.addEventListener('scroll', this.onScroll.bind(this));
  }

  componentWillUnMount() {
    this._composer.addEventListener('scroll', this.onScroll.bind(this));
  }

  onScroll(e) {
    // pseudo fixed position, wouldn't be necessary on iframes
    this._footer.style.bottom = -e.target.scrollTop + "px";
  }

  onFocus(index) {
    this.setState({ currentStep: index });
  }

  onSave(payload) {

    var pageCopy = Object.assign({}, this.state.page);
    pageCopy.widgets[payload.index] = Object.assign({},
      pageCopy.widgets[payload.index],
      payload
    );

    this.setState({ src: pageCopy });
  }

  getQuestionBarStyles(completedCount, fieldCount) {
    var widthPercent = Math.ceil(completedCount / fieldCount * 100);
    return Object.assign({},
      styles.answeredQuestionsBarComplete,
      { width: widthPercent + '%' }
    );
  }

  render() {
    // field count is artificial, not the widget index
    var fieldCount = 0;
    var completedCount = 0;
    return (
      <div style={ styles.footer } ref={ (footer) => this._footer = footer }>
        <div style={ styles.footerContent }>
          <div style={ styles.answeredQuestions }>
            <div style={ styles.answeredQuestionsBar }>
              <span style={ this.getQuestionBarStyles(this.props.completedCount, this.props.fieldCount) }></span>
            </div>
            <span style={ styles.answeredQuestionsText }>{ this.props.completedCount } of { this.props.fieldCount } questions answered.</span>
          </div>
          <div style={ styles.footerActions }>
            <button onClick={ this.props.onSubmit } style={ styles.submit }>Send</button>
          </div>
        </div>
      </div>
    )
  }

}

const styles = {
  base: {
    background: '#eee',
    position: 'relative',
    paddingBottom: '150px',
    height: '700px',
    overflowY: 'auto'
  },
  footer: {
    position: 'absolute',
    bottom: '0',
    width: '100%',
    height: '70px',
    background: '#eee',
    borderTop: '1px solid #ccc'
  },
  footerContent: {
    padding: '15px',
    display: 'flex'
  },
  answeredQuestions: {
    color: '#222',
    width: '400px',
    flexGrow: '1'
  },
  answeredQuestionsBar: {
    background: '#999',
    height: '15px',
    width: '100%',
    position: 'relative',
    marginBottom: '5px',
    borderRadius: '3px'
  },
  answeredQuestionsBarComplete: {
    background: '#090',
    height: '15px',
    position: 'absolute',
    top: '0',
    left: '0',
    transition: 'width .5s'
  },
  answeredQuestionsText: {
    fontSize: '10pt'
  },
  footerActions: {
    flexGrow: '1',
    textAlign: 'right'
  },
  submit: {
    background: '#00897B',
    padding: '10px 40px',
    boxShadow: '0 2px 2px #555',
    borderRadius: '2px',
    border: 'none',
    color: 'white',
    textTransform: 'uppercase',
    cursor: 'pointer'
  }
}

export default AskComposer;
