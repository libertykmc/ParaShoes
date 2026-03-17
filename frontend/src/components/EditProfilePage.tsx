import { FormEvent, useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { toast } from 'sonner'

interface EditProfilePageProps {
  user: {
    name: string
    phone: string
    address: string
  }
  isLoading?: boolean
  onSave: (payload: {
    fullName: string
    phone: string
    address: string
  }) => Promise<void>
  onCancel: () => void
}

export function EditProfilePage({
  user,
  isLoading,
  onSave,
  onCancel,
}: EditProfilePageProps) {
  const [fullName, setFullName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone)
  const [address, setAddress] = useState(user.address)

  useEffect(() => {
    setFullName(user.name)
    setPhone(user.phone)
    setAddress(user.address)
  }, [user])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!fullName.trim()) {
      toast.error('Введите ФИО')
      return
    }

    try {
      await onSave({
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
      })
    } catch {
      return
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-gray-900 mb-6 text-center">Редактирование профиля</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">ФИО</label>
            <Input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Введите ФИО"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Телефон</label>
            <Input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+7 (999) 123-45-67"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Адрес</label>
            <Input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Введите адрес"
              disabled={isLoading}
            />
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Сохраняем...' : 'Сохранить'}
            </Button>

            <Button type="button" variant="outline" className="w-full" onClick={onCancel} disabled={isLoading}>
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
