const CONSTANT_NOTIFICATION = {
    //app customer 
    DRIVER_ACEEPT_BOOKING: 'DRIVER_ACEEPT_BOOKING',
    DRIVER_PICK_UP_CUSTOMER: 'DRIVER_PICK_UP_CUSTOMER',
    DRIVER_DROP_OFF_CUSTOMER: 'DRIVER_DROP_OFF_CUSTOMER',
    //app driver
    SYSTEM_CANCLE_BOOKING: 'SYSTEM_CANCLE_BOOKING',
    CUSTOMER_REQUEST_TO_DRIVER: 'CUSTOMER_REQUEST_TO_DRIVER',
    DRIVER_VEIRY_STATUS: 'DRIVER_VEIRY_STATUS',
    DRIVER_LOCKED_ACCOUNT: 'DRIVER_LOCKED_ACCOUNT',
    DRIVER_UNLOCKED_ACCOUNT: 'DRIVER_UNLOCKED_ACCOUNT',
    // admin
    PROMOTION_NOTIFICATION: 'PROMOTION_NOTIFICATION',
    ALERT_NOTIFICATION: 'ALERT_NOTIFICATION',
    CHARGE_MONEY_SUCCESS: 'CHARGE_MONEY_SUCCESS',
    CHARGE_MONEY_FAILED: 'CHARGE_MONEY_FAILED',

}
const CONSTANT_TYPE_JOURNEYS = {
    HYBIRD_CAR: 'HYBIRD_CAR',
    COACH_CAR: 'COACH_CAR'
}
const CONSTANT_TYPE_BOOKING = {
    HYBIRD_CAR: 'HYBIRD_CAR',
    COACH_CAR: 'COACH_CAR',
    HYBIRD_DELIVERY_CAR: 'HYBIRD_DELIVERY_CAR',
    COACH_DELIVERY_CAR: 'COACH_DELIVERY_CAR'
}
const CONSTANT_STATUS_BOOKING = {
    FINDING_DRIVER: 'FINDING_DRIVER',
    WAITING_DRIVER: 'WAITING_DRIVER',
    PROCESSING: 'PROCESSING',
    END: 'END',
    USER_CANCEL: 'USER_CANCEL',
}
const CONSTANT_STATUS_JOUNEYS = {
    WAITING: 'WAITING',
    STARTED: 'STARTED',
    END: 'END',
    CANCEL: 'CANCEL'
}
const SERVICE_CHARGE = 0.05
const TYPE_TRANSACTION = {
    ACCEPT_BOOKING: 'ACCEPT_BOOKING',
    RETURN_APPLY_COUPON: 'RETURN_APPLY_COUPON',
    ADD_CHARGE_MONEY: 'ADD_CHARGE_MONEY',
    SEND_MONEY_TO_OTHER: 'SEND_MONEY_TO_OTHER'
}
const REDIS_KEY = {
    NOTIFICATION_DRIVER: 'REDIS:NOTIFICATION_DRIVER',
    NOTIFICATION_CUSTOMER: 'REDIS:NOTIFICATION_CUSTOMER'
}
module.exports = {
    CONSTANT_NOTIFICATION,
    CONSTANT_STATUS_BOOKING,
    CONSTANT_STATUS_JOUNEYS,
    SERVICE_CHARGE,
    TYPE_TRANSACTION,
    CONSTANT_TYPE_JOURNEYS,
    CONSTANT_TYPE_BOOKING,
    REDIS_KEY
}