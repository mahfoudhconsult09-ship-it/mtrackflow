import {createClient} from '@/lib/supabase/server';
import OrdersClient from './OrdersClient';

export default async function Orders(){
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 const businessId=user ? (await supabase.from('businesses').select('id').eq('owner_id',user.id).limit(1).maybeSingle()).data?.id : undefined;
 const {data:orders}=businessId ? await supabase.from('orders').select('id,order_number,product_name,order_value,status,updated_at,customers(name)').eq('business_id',businessId).order('updated_at',{ascending:false}).limit(100) : {data:[]};
 return <OrdersClient initialOrders={orders||[]}/>;
}
