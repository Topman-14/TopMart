'use client'

import toast from "react-hot-toast";
import axios from "axios";
import { useState } from "react";
import * as z from "zod";
import { Billboard } from "@prisma/client"
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { 
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel,
    FormMessage
 } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/alert-modal";
import { ApiAlert } from "@/components/ui/api-alert";
import { useOrigin } from "@/hooks/use-origin";

const formSchema = z.object({
    label: z.string().min(1),
    imageUrl: z.string().min(1),
});

type BillboardFormValues = z.infer<typeof formSchema>;

interface BillboardFormProps {
    initialData: Billboard | null;
}

const BillboardForm: React.FC<BillboardFormProps> = ({initialData}) => {

    const params = useParams();
    const router = useRouter();
    const origin = useOrigin();

    const title = initialData ? 'Edit Billboard' : 'New Billboard'

    const form = useForm<BillboardFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            label: '',
            imageUrl: ''
        },
    });

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const onSubmit = async (data: BillboardFormValues) => {
        try {
            setLoading(true)
            console.log(data)
            await axios.patch(`/api/stores/${params.storeId}`, data)
            router.refresh();
            toast.success('Store updated!')
        } catch (error) {
            toast.error('Something went wrong!')
            console.error(error)
        } finally{
            setLoading(false)
        }
    }

    const onDelete = async () => {
        try {
            setLoading(true)
            await axios.delete(`/api/stores/${params.storeId}`)
            router.refresh()
            router.push('/')
            toast.success('Store deleted!')
        } catch (error) {
            toast.error('Make sure you removed all products and categories first!')
            console.error(error)
        } finally{
            setLoading(false)
            setOpen(false)
        }
    }

  return (
    <>
        <AlertModal 
            isOpen={open}
            onClose={()=> setOpen(false)}
            onConfirm={onDelete}
            loading={loading}
        />
        <div className="flex items-center justify-between">
        <Heading
            title={title}
            description="Manage store preferences"
        />
        <Button 
            disabled={loading}
            variant={"destructive"}
            size={'icon'}
            onClick={()=> setOpen(true)}
        >
            <Trash className="size-4"/>
        </Button>
        </div>
        <Separator />
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
              <div className="grid grid-cols-3 gap-8">
                <FormField 
                    control={form.control} 
                    name="label"
                    render={({field}) => (
                    <FormItem>
                        <FormLabel>Label</FormLabel>
                        <FormControl>
                            <Input disabled={loading} placeholder="Label" {...field}/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>)}
                 />
              </div>
              <Button 
                className="font-extrabold ml-auto"
                type="submit"
                disabled={loading}
                >
                Save Changes
              </Button>
            </form>
        </Form>
        <Separator />
        <ApiAlert 
            title="NEXT_PUBLIC_API_URL" 
            description={`${origin}/api/${params.storeId}`}
            variant='public' 
        />
    </>
  )
}

export default BillboardForm