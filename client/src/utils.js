import moment, { unix as epoch } from 'moment';
import Web3 from 'web3';

const ERRORS = {
  'You have no Metamask installed': {
    displayError: true,
    log: false,
    message: 'You have no Metamask installed.'
  },
  'You are connected to the wrong network': {
    displayError: true,
    log: false,
    message: 'You are connected to the wrong network.'
  },
  'User rejected the request': {
    displayError: true,
    log: false,
    message: 'You rejected the connect request.'
  },
  'User denied transaction signature': {
    displayError: false,
    log: false,
    message: 'MetaMask Tx Signature: User denied transaction signature.'
  },
  'Loketh: Organizer can not buy their own event': {
    displayError: true,
    log: false,
    message: 'You can not buy a ticket from your own event.'
  },
  'Loketh: Participant already bought the ticket': {
    displayError: true,
    log: false,
    message: 'You are already buy this ticket.'
  }
};

class ErrorHandler {
  constructor(error) {
    if (error instanceof Error) {
      this.error = error;
    } else if ((typeof error === 'object') && error.message) {
      this.error = new Error(error.message);
    } else {
      this.error = new Error(error);
    }

    const key = Object.keys(ERRORS).find(err => {
      return this.error.message.includes(err);
    })

    this._error = key ? ERRORS[key] : null;
  }

  get displayError() {
    return this._error ? this._error.displayError : true;
  }

  get log() {
    return this._error ? this._error.log : true;
  }

  get message() {
    return this._error ? this._error.message : 'Something went wrong.';
  }
}

class Event {
  constructor(event, id) {
    this.event = event;
    this.id = id;
  }

  get name() {
    return this.event['0'];
  }

  get shortName() {
    return strLimit(this.name, 25);
  }

  get organizer() {
    return this.event['1'];
  }

  get shortOrganizer() {
    return getShortAddress(this.organizer);
  }

  get startTime() {
    return this.event['2'];
  }

  get startTimeMoment() {
    return epoch(this.startTime);
  }

  get startTimeDisplay() {
    return this.startTimeMoment.format('DD MMM YYYY HH:mm:ss');
  }

  get endTime() {
    return this.event['3'];
  }

  get endTimeMoment() {
    return epoch(this.endTime);
  }

  get endTimeDisplay() {
    return this.endTimeMoment.format('DD MMM YYYY HH:mm:ss');
  }

  get ended() {
    return moment().isAfter(this.endTimeMoment);
  }

  get onlyOneDay() {
    return this.startTimeMoment.isSame(this.endTimeMoment, 'day');
  }

  get displayDate() {
    return this.onlyOneDay
      ? epochToEventDate(this.startTime)
      : [this.startTime, this.endTime].map(epochToEventDate).join(' - ');
  }

  get price() {
    return this.event['4'];
  }

  get priceInEth() {
    return fromWei(this.price);
  }

  get isFree() {
    return toBN(this.price).eq(toBN('0'));
  }

  get quota() {
    return this.event['5'];
  }

  get soldCounter() {
    return this.event['6'];
  }

  get soldOut() {
    return toBN(this.soldCounter).lt(toBN(this.quota)) === false;
  }

  get moneyCollected() {
    return this.event['7'];
  }

  get moneyCollectedInEth() {
    return fromWei(this.moneyCollected);
  }

  get moneyCollectedInBN() {
    return toBN(this.moneyCollected);
  }

  get hasMoneyToWithdraw() {
    return this.moneyCollectedInBN.gt(toBN('0'));
  }
}

export function arrayChunk(array, chunk = 10) {
  let i, j;
  const result = [];

  for (i = 0, j = array.length; i < j; i += chunk) {
    result.push(array.slice(i, i + chunk));
  }

  return result;
}

export function descPagination(total, page = 1, perPage = 10, zeroBased = true) {
  total = zeroBased ? (total - 1) : total;

  const maxId = total - ((page - 1) * perPage);

  const min = zeroBased ? -1 : 0;
  const minId = ((maxId - perPage) < min) ? min : (maxId - perPage);

  const hasPrev = maxId < total;
  const hasNext = minId > min;

  return { maxId, minId, hasPrev, hasNext };
}

export function epochToEventDate(seconds) {
  return epoch(seconds).format('MMM D, YYYY');
}

export function fromWei(number, unit = 'ether', digits = 4) {
  return parseFloat(Web3.utils.fromWei(number, unit)).toFixed(digits);
}

export function getShortAddress(address) {
  return `${address.substr(0, 6)}...${address.substr(-4)}`;
}

export function handleError(error) {
  const errorHandler = toErrorHandler(error);

  if (errorHandler.displayError) {
    alert(errorHandler.message);
  }

  if (errorHandler.log) {
    console.error(error);
  }
}

export function isAddress(address) {
  return Web3.utils.isAddress(address);
}

export function strLimit(str, limit = 20) {
  if (str.length > limit) {
    return `${str.substr(0, limit)}...`;
  }

  return str;
}

export function toBN(number) {
  return new Web3.utils.BN(number.toString());
}

export function toEvent(event, id = 0) {
  return new Event(event, id);
}

export function toErrorHandler(error) {
  return new ErrorHandler(error);
}

export function toWei(number, unit = 'ether') {
  return Web3.utils.toWei(number.toString(), unit);
}
